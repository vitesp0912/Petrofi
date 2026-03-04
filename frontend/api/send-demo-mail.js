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

    const { name, pump_name, city, phone, email } = req.body || {};
    const to = process.env.DEMO_MAIL_TO || process.env.SMTP_MAIL_USER;
    const host = process.env.SMTP_MAIL_HOST;
    const user = process.env.SMTP_MAIL_USER;
    const pass = process.env.SMTP_MAIL_APP_PASSWORD;
    const port = parseInt(process.env.SMTP_MAIL_PORT || '587', 10);

    if (!host || !user || !pass || !to) {
        res.status(500).json({
            error: 'Server mail config missing. Set SMTP_MAIL_HOST, SMTP_MAIL_USER, SMTP_MAIL_APP_PASSWORD, DEMO_MAIL_TO in Vercel.',
        });
        return;
    }

    const subject = `New PetroFI demo request from ${name || 'Prospect'}`;
    const text = [
        'New demo request for PetroFI:',
        '',
        `Name: ${name || '-'}`,
        `Pump Name: ${pump_name || '-'}`,
        `City: ${city || '-'}`,
        `Phone: ${phone || '-'}`,
        `Email: ${email || '-'}`,
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
            replyTo: email || undefined,
        });
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Send mail error:', err.message);
        res.status(500).json({ error: 'Failed to send email', message: err.message });
    }
};
