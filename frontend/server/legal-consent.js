const REFUND_POLICY = {
    documentType: 'REFUND_POLICY',
    documentVersion: 'v1.0',
    documentUrl: 'https://www.petrofi.in/refund-policy',
};

function requestMeta(req) {
    const forwarded = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '';
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip = String(raw).split(',')[0].trim().slice(0, 80);
    const userAgent = String(req.headers['user-agent'] || '').trim().slice(0, 512);
    return {
        ip_address: ip || null,
        user_agent: userAgent || null,
    };
}

async function recordRefundConsent(admin, { userId, pumpId, req }) {
    const meta = requestMeta(req);
    const { error } = await admin.from('user_legal_consents').upsert({
        user_id: userId,
        pump_id: pumpId,
        document_type: REFUND_POLICY.documentType,
        document_version: REFUND_POLICY.documentVersion,
        document_url: REFUND_POLICY.documentUrl,
        ip_address: meta.ip_address,
        user_agent: meta.user_agent,
    }, {
        onConflict: 'user_id,pump_id,document_type,document_version',
        ignoreDuplicates: true,
    });
    if (error) {
        const err = new Error('consent_failed');
        err.reason = 'consent_failed';
        throw err;
    }
}

module.exports = {
    REFUND_POLICY,
    recordRefundConsent,
};
