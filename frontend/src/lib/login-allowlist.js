export const LOGIN_ALLOWLIST_MESSAGE =
    'PetroFI login is temporarily limited. Please contact support if you need access.';

const ALLOWED_EMAIL = 'abhibhai131203@gmail.com';
const ALLOWED_PHONES = new Set(['7398621812', '8700117495']);

export function phone10(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits.length === 10 ? digits : '';
}

export function isLoginAllowed({ email, phone, phone10: phoneDigits } = {}) {
    const mail = String(email || '').trim().toLowerCase();
    if (mail && mail === ALLOWED_EMAIL) return true;
    const digits = phone10(phoneDigits || phone);
    return Boolean(digits && ALLOWED_PHONES.has(digits));
}
