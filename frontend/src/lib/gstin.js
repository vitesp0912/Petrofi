const GSTIN_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const STATE_CODES = new Set([
    '01', '02', '03', '04', '05', '06', '07', '08', '09',
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
    '30', '31', '32', '33', '34', '35', '36', '37', '38',
    '97',
]);

function gstinBody(value) {
    return String(value || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
}

function gstinCheckCharacter(first14) {
    let factor = 2;
    let sum = 0;
    const mod = GSTIN_CHARSET.length;
    for (let i = first14.length - 1; i >= 0; i -= 1) {
        const code = GSTIN_CHARSET.indexOf(first14[i]);
        if (code < 0) return '';
        let digit = factor * code;
        factor = factor === 2 ? 1 : 2;
        digit = Math.floor(digit / mod) + (digit % mod);
        sum += digit;
    }
    return GSTIN_CHARSET[(mod - (sum % mod)) % mod];
}

function isValidGstin(value) {
    const gstin = gstinBody(value);
    if (!GSTIN_RE.test(gstin)) return false;
    if (!STATE_CODES.has(gstin.slice(0, 2))) return false;
    return gstinCheckCharacter(gstin.slice(0, 14)) === gstin[14];
}

function normalizeGstin(value) {
    const gstin = gstinBody(value);
    if (!gstin) return '';
    if (!isValidGstin(gstin)) return null;
    return gstin;
}

module.exports = {
    GSTIN_RE,
    STATE_CODES,
    gstinBody,
    gstinCheckCharacter,
    isValidGstin,
    normalizeGstin,
};
