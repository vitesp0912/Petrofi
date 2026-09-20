const nodemailer = require('nodemailer');

/**
 * Vercel serverless function: sends demo request form data via SMTP.
 * Set env vars in Vercel (or .env locally): SMTP_MAIL_HOST, SMTP_MAIL_PORT,
 * SMTP_MAIL_USER, SMTP_MAIL_APP_PASSWORD, DEMO_MAIL_TO
 */
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const clip = (value, max) => String(value ?? '').trim().slice(0, max);
    const name = clip(req.body?.name, 80);
    const pump_name = clip(req.body?.pump_name, 80);
    const city = clip(req.body?.city, 80);
    const phone = clip(req.body?.phone, 20);
    const email = clip(req.body?.email, 254);
    const address = clip(req.body?.address, 200);
    const source = req.body?.source === 'screenshots' ? 'screenshots' : 'demo';
    const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
    const to = process.env.DEMO_MAIL_TO || process.env.SMTP_MAIL_USER;
    const host = process.env.SMTP_MAIL_HOST;
    const user = process.env.SMTP_MAIL_USER;
    const pass = (process.env.SMTP_MAIL_APP_PASSWORD || '').replace(/\s/g, '');
    const port = parseInt(process.env.SMTP_MAIL_PORT || '587', 10);

    if (!host || !user || !pass || !to) {
        res.status(500).json({ error: 'Mail is not configured.' });
        return;
    }

    const isRegister = source === 'screenshots';
    const subject = isRegister
        ? `New PetroFI pump registration from ${name || 'Prospect'}`
        : `New PetroFI demo request from ${name || 'Prospect'}`;
    const text = [
        isRegister ? 'New pump registration for PetroFI:' : 'New demo request for PetroFI:',
        '',
        `Name: ${name || '-'}`,
        `Pump Name: ${pump_name || '-'}`,
        `Phone: ${phone || '-'}`,
        `Address: ${address || '-'}`,
        `City: ${city || '-'}`,
        `Email: ${email || '-'}`,
        `Source: ${source || 'demo'}`,
    ].join('\n');

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
        await transporter.sendMail({
            from: user,
            to,
            subject,
            text,
            replyTo,
        });
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Send mail error:', err.message);
        res.status(500).json({ error: 'Failed to send email' });
    }
};
