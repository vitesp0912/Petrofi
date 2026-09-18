const path = require('path');

const HANDLERS = {
    '/api/subscription': path.join(__dirname, 'subscription.js'),
    '/api/send-demo-mail': path.join(__dirname, 'send-demo-mail.js'),
};

function pathnameOf(req) {
    return String(req.url || req.originalUrl || '').split('?')[0];
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        if (req.body && typeof req.body === 'object') {
            resolve();
            return;
        }
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk;
            if (raw.length > 100 * 1024) {
                req.destroy();
                reject(new Error('payload too large'));
            }
        });
        req.on('end', () => {
            if (!raw) {
                req.body = {};
                resolve();
                return;
            }
            try {
                req.body = JSON.parse(raw);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

function localApiMiddleware(req, res, next) {
    const file = HANDLERS[pathnameOf(req)];
    if (!file) {
        next();
        return;
    }

    const run = () => {
        delete require.cache[require.resolve(file)];
        const handler = require(file);
        return Promise.resolve(handler(req, res));
    };

    const needsBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';
    const task = needsBody ? readJsonBody(req).then(run) : run();
    task.catch(next);
}

module.exports = { localApiMiddleware };
