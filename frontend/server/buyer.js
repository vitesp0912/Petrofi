const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
}

function indianMobile(value) {
    let digits = digitsOnly(value);
    if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
    if (digits.length === 10 && /^[6-9]/.test(digits)) return digits;
    return '';
}

function normalizeGstin(value) {
    const gstin = String(value || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!gstin) return '';
    if (!GSTIN_RE.test(gstin)) return null;
    return gstin;
}

function buyerFrom(user, profile, pump) {
    const name = String(profile?.name || pump?.owner_name || pump?.name || '').trim().slice(0, 80);
    const email = String(user?.email || pump?.email || '').trim().toLowerCase().slice(0, 120);
    const phone = indianMobile(pump?.phone || user?.phone || '');
    return {
        name: name || 'PetroFI customer',
        email: email && email.includes('@') ? email : '',
        phone,
        pumpName: pump?.name || '',
        pumpCode: pump?.pump_code || '',
        address: String(pump?.address || '').trim(),
        city: String(pump?.city || '').trim(),
        state: String(pump?.state || pump?.pump_state || '').trim(),
        pincode: String(pump?.pincode || '').replace(/\D/g, '').slice(0, 6),
    };
}

function cashfreeCustomer(userId, buyer) {
    const customer = {
        customer_id: `u${String(userId || '').replace(/-/g, '')}`.slice(0, 50),
        customer_name: String(buyer.name || 'Customer').slice(0, 100),
        customer_phone: buyer.phone,
    };
    if (buyer.email) customer.customer_email = String(buyer.email).slice(0, 100);
    return customer;
}

module.exports = {
    GSTIN_RE,
    indianMobile,
    normalizeGstin,
    buyerFrom,
    cashfreeCustomer,
};
