const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'api');

const HANDLERS = {
    '/api/subscription': path.join(apiDir, 'subscription.js'),
    '/api/send-demo-mail': path.join(apiDir, 'send-demo-mail.js'),
    '/api/payment-catalog': path.join(apiDir, 'payment-catalog.js'),
    '/api/payment-create-order': path.join(apiDir, 'payment-create-order.js'),
    '/api/payment-status': path.join(apiDir, 'payment-status.js'),
    '/api/payment-save': path.join(apiDir, 'payment-save.js'),
    '/api/payment-webhook': path.join(apiDir, 'payment-webhook.js'),
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
    if (!file || !fs.existsSync(file)) {
        next();
        return;
    }

    const run = () => {
        const roots = [path.resolve(apiDir), path.resolve(__dirname)].map((root) =>
            root.replace(/\\/g, '/').toLowerCase()
        );
        Object.keys(require.cache).forEach((id) => {
            const normalized = String(id).replace(/\\/g, '/').toLowerCase();
            if (normalized.includes('/node_modules/')) return;
            if (roots.some((root) => normalized.startsWith(root))) {
                delete require.cache[id];
            }
        });
        const handler = require(file);
        return Promise.resolve(handler(req, res));
    };

    const isWebhook = pathnameOf(req) === '/api/payment-webhook';
    const needsBody = !isWebhook && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH');
    const task = needsBody ? readJsonBody(req).then(run) : run();
    task.catch(next);
}

module.exports = { localApiMiddleware };
