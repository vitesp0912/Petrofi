const PLAN_CATALOG = require('./plan-catalog.json');

const GST_RATE = Number(PLAN_CATALOG.gstRate);
const EARLY_BIRD_LAST_DAY = PLAN_CATALOG.earlyBirdLastDay;
const PLANS = PLAN_CATALOG.plans;

function kolkataDay(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
}

function isEarlyBirdActive(now = new Date()) {
    return kolkataDay(now) <= EARLY_BIRD_LAST_DAY;
}

function gstAmount(base) {
    return Math.round(Number(base) * GST_RATE);
}

function quotePlan(plan, now = new Date()) {
    const early = isEarlyBirdActive(now) && !plan.noDiscount;
    const base = early ? plan.earlyBird : plan.standard;
    const gst = gstAmount(base);
    return {
        id: plan.id,
        name: plan.name,
        months: plan.months,
        billedAs: plan.billedAs,
        featured: Boolean(plan.featured),
        noDiscount: Boolean(plan.noDiscount),
        early,
        base,
        gst,
        total: base + gst,
        gstPct: Math.round(GST_RATE * 100),
    };
}

function getPlan(planId) {
    return PLANS.find((plan) => plan.id === planId) || null;
}

function quoteById(planId, now = new Date()) {
    const plan = getPlan(planId);
    if (!plan) return null;
    return quotePlan(plan, now);
}

function listQuotes(now = new Date()) {
    return PLANS.map((plan) => quotePlan(plan, now));
}

module.exports = {
    GST_RATE,
    EARLY_BIRD_LAST_DAY,
    PLANS,
    isEarlyBirdActive,
    quotePlan,
    quoteById,
    listQuotes,
    getPlan,
};
