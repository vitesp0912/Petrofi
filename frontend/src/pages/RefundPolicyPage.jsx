import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout, {
    LegalContactCard,
    LegalList,
    LegalP,
    LegalSection,
} from '../components/LegalPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

const SECTIONS = [
    { id: 'introduction', number: '1', title: 'Introduction' },
    { id: 'cancellation', number: '2', title: 'Subscription cancellation' },
    { id: 'guarantee', number: '3', title: '15-day refund guarantee' },
    { id: 'after-window', number: '4', title: 'Refunds after 15 days' },
    { id: 'duplicates', number: '5', title: 'Duplicate payments and billing errors' },
    { id: 'availability', number: '6', title: 'Service availability and deficiency' },
    { id: 'procedure', number: '7', title: 'Refund request procedure' },
    { id: 'processing', number: '8', title: 'Refund processing' },
    { id: 'renewal', number: '9', title: 'Subscription renewal' },
    { id: 'grievance', number: '10', title: 'Grievance redressal' },
    { id: 'amendments', number: '11', title: 'Amendments' },
    { id: 'governing-law', number: '12', title: 'Governing law' },
];

const RefundPolicyPage = () => {
    usePageMeta({
        title: 'Refund and Cancellation Policy | PetroFI',
        description:
            'How to cancel a PetroFI subscription and when a refund is available. The first paid subscription for a pump can be refunded within 15 calendar days of activation.',
        canonical: 'https://www.petrofi.in/refund-policy',
    });

    return (
        <LegalPageLayout
            eyebrow="Refund and Cancellation Policy · v1.0"
            title="Refund and Cancellation Policy"
            intro="This policy governs cancellation and refunds for PetroFI subscriptions."
            version="v1.0"
            effectiveDate="31 October 2026"
            lastUpdated="31 October 2026"
            controller="Vitespace Private Limited"
            sections={SECTIONS}
            related={{
                title: 'Terms of Service',
                description: 'Trial rules, how a manual renewal works, and notice before a price change.',
                to: '/terms-of-service',
                cta: 'Read the Terms',
            }}
        >
            <LegalSection id="introduction" number="1" title="Introduction">
                <LegalP>
                    This Refund and Cancellation Policy governs subscriptions to PetroFI, a petrol pump management
                    software service provided by{' '}
                    <strong className="text-pf-navy font-semibold">Vitespace Private Limited</strong>, operating under
                    the PetroFI brand (“PetroFI”, “we”, “us”, or “our”).
                </LegalP>
                <LegalP>
                    By purchasing a PetroFI subscription, you agree to this policy, along with our{' '}
                    <Link className="text-pf-sky hover:underline" to="/terms-of-service">Terms of Service</Link> and{' '}
                    <Link className="text-pf-sky hover:underline" to="/privacy-policy">Privacy Policy</Link>.
                </LegalP>
            </LegalSection>

            <LegalSection id="cancellation" number="2" title="Subscription cancellation">
                <LegalP>
                    You may cancel your PetroFI subscription at any time by contacting support at{' '}
                    <a className="text-pf-sky hover:underline" href="mailto:admin@petrofi.in">admin@petrofi.in</a>, or
                    by calling{' '}
                    <a className="text-pf-sky hover:underline" href="tel:+917398621812">+91 7398621812</a>
                    {' or '}
                    <a className="text-pf-sky hover:underline" href="tel:+918700117495">+91 8700117495</a>.
                </LegalP>
                <LegalP>Upon cancellation:</LegalP>
                <LegalList
                    items={[
                        'Your subscription will not renew for the next billing period.',
                        'You may continue using PetroFI until the end of your current paid subscription period, unless your account is terminated for a separate lawful reason.',
                        'Cancellation does not automatically result in a refund. Refund eligibility is determined under this policy.',
                    ]}
                />
            </LegalSection>

            <LegalSection id="guarantee" number="3" title="15-day refund guarantee">
                <LegalP>
                    PetroFI offers a 15-calendar-day refund guarantee on the first paid subscription purchased for a pump.
                </LegalP>
                <LegalP>To qualify:</LegalP>
                <LegalList
                    items={[
                        'The refund request must be submitted within 15 calendar days from the subscription activation date.',
                        'The request must relate to the first paid subscription for that pump.',
                        'The subscription must not have already received a refund under this guarantee.',
                    ]}
                />
                <LegalP>
                    Eligible customers will receive a full refund of the subscription fee paid, including applicable GST,
                    subject to legally required tax adjustments.
                </LegalP>
                <LegalP>
                    The refund guarantee applies to the initial subscription purchase and does not automatically apply to
                    subsequent renewals, upgrades, or additional subscription periods.
                </LegalP>
            </LegalSection>

            <LegalSection id="after-window" number="4" title="Refunds after the 15-day period">
                <LegalP>After the 15-day refund window expires:</LegalP>
                <LegalList
                    items={[
                        'Subscription fees are generally non-refundable.',
                        'Early cancellation of a prepaid subscription does not entitle the customer to a refund for the unused portion of the subscription period.',
                        'Renewal payments are not refundable merely because the customer cancels after renewal.',
                    ]}
                />
                <LegalP>
                    Exceptions may apply where required by applicable law, including duplicate payments, erroneous
                    charges, or material failure to provide the subscribed service.
                </LegalP>
            </LegalSection>

            <LegalSection id="duplicates" number="5" title="Duplicate payments and billing errors">
                <LegalP>
                    If you are charged more than once for the same subscription, or you are charged an incorrect amount,
                    contact us with your payment reference.
                </LegalP>
                <LegalP>Verified duplicate payments and billing errors will be corrected or refunded.</LegalP>
            </LegalSection>

            <LegalSection id="availability" number="6" title="Service availability and deficiency">
                <LegalP>
                    If PetroFI is unable to provide the paid service due to a material service failure attributable to
                    PetroFI, contact support for review.
                </LegalP>
                <LegalP>
                    Depending on the circumstances and applicable law, we may provide a refund, a service extension, or
                    another appropriate remedy.
                </LegalP>
                <LegalP>
                    Nothing in this policy excludes or limits any rights or remedies that cannot lawfully be excluded or
                    limited.
                </LegalP>
            </LegalSection>

            <LegalSection id="procedure" number="7" title="Refund request procedure">
                <LegalP>To request a refund:</LegalP>
                <LegalList
                    items={[
                        {
                            key: 'contact',
                            content: (
                                <>
                                    Contact support at{' '}
                                    <a className="text-pf-sky hover:underline" href="mailto:admin@petrofi.in">admin@petrofi.in</a>,
                                    or call{' '}
                                    <a className="text-pf-sky hover:underline" href="tel:+917398621812">+91 7398621812</a>
                                    {' or '}
                                    <a className="text-pf-sky hover:underline" href="tel:+918700117495">+91 8700117495</a>.
                                </>
                            ),
                        },
                        'Provide your registered account details, pump name, payment reference, and refund request.',
                        'PetroFI will review your request and notify you of its decision.',
                    ]}
                />
                <LegalP>
                    We may request reasonable information necessary to verify the payment and account ownership.
                </LegalP>
            </LegalSection>

            <LegalSection id="processing" number="8" title="Refund processing">
                <LegalP>Approved refunds will be initiated within 7 business days of approval.</LegalP>
                <LegalP>
                    Refunds will generally be returned to the original payment method. The time taken for the funds to
                    appear in your account may depend on your bank, payment provider, or card issuer.
                </LegalP>
                <LegalP>PetroFI does not guarantee a specific bank processing time.</LegalP>
            </LegalSection>

            <LegalSection id="renewal" number="9" title="Subscription renewal">
                <LegalP>
                    PetroFI does not renew a subscription automatically and does not take automatic deductions.
                    Subscription fees are payable in advance for the billing period you choose. You renew by starting a
                    payment yourself, and you may choose not to renew at any time.
                </LegalP>
                <LegalP>
                    The billing period and amount are shown before you pay. Renewal and price changes are also described
                    in the{' '}
                    <Link className="text-pf-sky hover:underline" to="/terms-of-service">Terms of Service</Link>.
                </LegalP>
            </LegalSection>

            <LegalSection id="grievance" number="10" title="Grievance redressal">
                <LegalP>For refund-related complaints or unresolved concerns, contact:</LegalP>
                <LegalContactCard>
                    <p className="text-base font-bold font-outfit text-pf-navy mb-1">Vitespace Private Limited</p>
                    <p className="text-sm text-slate-500 font-jakarta mb-4">Grievance contact for PetroFI</p>
                    <div className="space-y-2 text-sm font-jakarta text-slate-600">
                        <p>
                            <strong className="text-pf-navy">Email:</strong>{' '}
                            <a className="text-pf-sky hover:underline" href="mailto:admin@petrofi.in">admin@petrofi.in</a>
                        </p>
                        <p>
                            <strong className="text-pf-navy">Phone:</strong>{' '}
                            <a className="text-pf-sky hover:underline" href="tel:+917398621812">+91 7398621812</a>
                            {' · '}
                            <a className="text-pf-sky hover:underline" href="tel:+918700117495">+91 8700117495</a>
                        </p>
                        <p>
                            <strong className="text-pf-navy">Postal address:</strong> S-4/783, Shalimar Garden,
                            Extension -1, Sahibabad, Ghaziabad
                        </p>
                    </div>
                </LegalContactCard>
                <LegalP>
                    We will acknowledge grievances within 48 hours and endeavour to resolve them within one month,
                    subject to applicable law.
                </LegalP>
            </LegalSection>

            <LegalSection id="amendments" number="11" title="Amendments">
                <LegalP>
                    PetroFI may update this policy from time to time. Material changes will be communicated through
                    appropriate channels.
                </LegalP>
                <LegalP>
                    The policy applicable to a subscription purchase will be the version presented and accepted at the
                    time of that purchase, subject to applicable law.
                </LegalP>
            </LegalSection>

            <LegalSection id="governing-law" number="12" title="Governing law">
                <LegalP>
                    This policy is governed by the laws of India. Nothing in this policy limits any mandatory rights or
                    remedies available to customers under applicable law.
                </LegalP>
            </LegalSection>
        </LegalPageLayout>
    );
};

export default RefundPolicyPage;
