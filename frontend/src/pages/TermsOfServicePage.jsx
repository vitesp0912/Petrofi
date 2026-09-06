import React from 'react';
import LegalPageLayout, {
    LegalCallout,
    LegalContactCard,
    LegalH3,
    LegalList,
    LegalP,
    LegalSection,
} from '../components/LegalPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

const SECTIONS = [
    { id: 'about', number: '1', title: 'About PetroFI and Vitespace' },
    { id: 'eligibility', number: '2', title: 'Eligibility and accounts' },
    { id: 'authentication', number: '3', title: 'Authentication' },
    { id: 'licence', number: '4', title: 'Licence to use the Service' },
    { id: 'your-data', number: '5', title: 'Your data and content' },
    { id: 'subscriptions', number: '6', title: 'Subscriptions, approvals, and payments' },
    { id: 'acceptable-use', number: '7', title: 'Acceptable use' },
    { id: 'third-party', number: '8', title: 'Third-party services' },
    { id: 'ip', number: '9', title: 'Intellectual property' },
    { id: 'confidentiality', number: '10', title: 'Confidentiality' },
    { id: 'disclaimers', number: '11', title: 'Disclaimers' },
    { id: 'liability', number: '12', title: 'Limitation of liability' },
    { id: 'indemnity', number: '13', title: 'Indemnity' },
    { id: 'termination', number: '14', title: 'Suspension and termination' },
    { id: 'changes', number: '15', title: 'Changes to the Service and Terms' },
    { id: 'governing-law', number: '16', title: 'Governing law and disputes' },
    { id: 'general', number: '17', title: 'General' },
    { id: 'contact', number: '18', title: 'Contact' },
];

const TermsOfServicePage = () => {
    usePageMeta({
        title: 'Terms of Service | PetroFI',
        description:
            'Terms of Service for PetroFI by Vitespace Private Limited. Rules for using the petrol pump management software on mobile and web.',
        canonical: 'https://www.petrofi.in/terms-of-service',
    });

    return (
        <LegalPageLayout
            eyebrow="Terms of Service · v1.0"
            title="Terms of Service"
            intro=""
            version="v1.0"
            effectiveDate="6 September 2026"
            lastUpdated="6 September 2026"
            controller="Vitespace Private Limited"
            sections={SECTIONS}
        >
            <LegalSection id="about" number="1" title="About PetroFI and Vitespace">
                <LegalP>
                    PetroFI is a business software product of{' '}
                    <strong className="text-pf-navy font-semibold">Vitespace Private Limited</strong>. It helps fuel
                    retail outlets (petrol pumps / retail outlets) manage day-to-day operations and finance, including
                    meter readings, sales and expenses, credit (udhar) ledger, treasury and bank balances, fuel stock,
                    inventory, shifts, and reports.
                </LegalP>
                <LegalP>
                    Registered office: S-4/783, Shalimar Garden, Extension -1, Sahibabad, Ghaziabad
                </LegalP>
                <LegalP>
                    <strong className="text-pf-navy font-semibold">Support / contact:</strong>
                </LegalP>
                <LegalList
                    items={[
                        {
                            key: 'email',
                            content: (
                                <>
                                    <strong className="text-pf-navy font-semibold">Email:</strong>{' '}
                                    <a className="text-pf-sky hover:underline" href="mailto:admin@petrofi.in">admin@petrofi.in</a>
                                    {', '}
                                    <a className="text-pf-sky hover:underline" href="mailto:petrofibusiness@gmail.com">petrofibusiness@gmail.com</a>
                                </>
                            ),
                        },
                        {
                            key: 'phone',
                            content: (
                                <>
                                    <strong className="text-pf-navy font-semibold">Phone:</strong>{' '}
                                    <a className="text-pf-sky hover:underline" href="tel:+917398621812">+91 7398621812</a>
                                    {', '}
                                    <a className="text-pf-sky hover:underline" href="tel:+918700117495">+91 8700117495</a>
                                </>
                            ),
                        },
                    ]}
                />
            </LegalSection>

            <LegalSection id="eligibility" number="2" title="Eligibility and accounts">
                <LegalP>
                    2.1. The Service is intended for <strong className="text-pf-navy font-semibold">business users</strong> operating
                    or working at a fuel retail outlet (owners/dealers, managers, field staff, and similar authorised roles).
                </LegalP>
                <LegalP>
                    2.2. You must provide accurate registration information (such as name, phone number, optional email,
                    outlet name, and address). Dealer self-registration may remain{' '}
                    <strong className="text-pf-navy font-semibold">pending</strong> until Vitespace or an authorised
                    administrator approves the outlet.
                </LegalP>
                <LegalP>2.3. You are responsible for:</LegalP>
                <LegalList
                    items={[
                        'Keeping login credentials and OTP-capable devices secure',
                        'All activity under your account',
                        'Ensuring only authorised staff access your outlet’s data',
                    ]}
                />
                <LegalP>
                    2.4. Account roles (for example dealer, manager, FSM) determine what features and data you can access.
                    Dealers or owners who invite staff are responsible for assigning appropriate roles and deactivating
                    access when staff leave.
                </LegalP>
            </LegalSection>

            <LegalSection id="authentication" number="3" title="Authentication">
                <LegalP>
                    3.1. Access is provided primarily through <strong className="text-pf-navy font-semibold">one-time passwords (OTP)</strong> sent
                    to your registered <strong className="text-pf-navy font-semibold">mobile number</strong> and/or{' '}
                    <strong className="text-pf-navy font-semibold">email address</strong>, using our authentication
                    infrastructure and SMS/email delivery partners.
                </LegalP>
                <LegalP>
                    3.2. You agree not to share OTPs, attempt to bypass authentication, or access another user’s account.
                </LegalP>
                <LegalP>
                    3.3. We may suspend or terminate access if we reasonably believe an account is compromised, inactive
                    without approval, or used in violation of these Terms.
                </LegalP>
            </LegalSection>

            <LegalSection id="licence" number="4" title="Licence to use the Service">
                <LegalP>
                    4.1. Subject to these Terms and any applicable subscription or commercial agreement, Vitespace grants
                    you a limited, non-exclusive, non-transferable, revocable licence to use the Service for your outlet’s
                    internal business operations.
                </LegalP>
                <LegalP>4.2. You may not:</LegalP>
                <LegalList
                    items={[
                        'Copy, modify, reverse engineer, or create derivative works of the Service except as allowed by law',
                        'Rent, resell, or sublicense the Service to third parties without our written consent',
                        'Use the Service to build a competing product using our proprietary designs, documentation, or non-public APIs',
                        'Interfere with Service integrity, security, or availability',
                        'Upload unlawful, harmful, or infringing content',
                    ]}
                />
            </LegalSection>

            <LegalSection id="your-data" number="5" title="Your data and content">
                <LegalP>
                    5.1. <strong className="text-pf-navy font-semibold">Your Content</strong> includes operational and
                    business data you (or your staff) enter or generate in PetroFI, such as meter readings, sales,
                    expenses, credit ledger entries, customer credit information, treasury transactions, tank levels,
                    inventory, reports, and outlet configuration.
                </LegalP>
                <LegalP>
                    5.2. You retain ownership of Your Content. You grant Vitespace a licence to host, process, transmit,
                    and display Your Content solely to provide, secure, maintain, and improve the Service, and as
                    otherwise described in our Privacy Policy.
                </LegalP>
                <LegalP>
                    5.3. You represent that you have the right to submit Your Content and that doing so does not violate
                    law or third-party rights (including customer privacy and applicable fuel-retail or accounting
                    regulations).
                </LegalP>
                <LegalP>
                    5.4. You are responsible for the accuracy of operational and financial records entered in PetroFI.
                    PetroFI is a <strong className="text-pf-navy font-semibold">management and record-keeping tool</strong>;
                    it does not replace statutory books, tax filings, or professional advice unless expressly agreed in writing.
                </LegalP>
                <LegalP>
                    5.5. For the purposes of applicable data protection laws (including the DPDP Act, 2023), you
                    acknowledge that you are the <strong className="text-pf-navy font-semibold">Data Fiduciary</strong> regarding
                    any third-party personal data you enter into the Service (such as customer phone numbers or debt
                    entries in the credit/Udhar ledger). Vitespace acts solely as a{' '}
                    <strong className="text-pf-navy font-semibold">Data Processor</strong> operating on your behalf and
                    instructions. You represent that you have obtained all necessary consents from your customers and
                    employees to input their data into PetroFI.
                </LegalP>
            </LegalSection>

            <LegalSection id="subscriptions" number="6" title="Subscriptions, approvals, and payments">
                <LegalP>
                    6.1. Access may depend on registration approval, subscription status, and/or payment verification as
                    configured for your outlet.
                </LegalP>
                <LegalP>
                    6.2. Fees, billing cycles, trials, and refunds (if any) will be as stated in a separate order form,
                    invoice, website pricing page, or written agreement with Vitespace. Unpaid or suspended subscriptions
                    may result in restricted or terminated access.
                </LegalP>
                <LegalP>
                    6.3. Taxes applicable under Indian law (or other applicable jurisdiction) are your responsibility
                    unless otherwise stated.
                </LegalP>
            </LegalSection>

            <LegalSection id="acceptable-use" number="7" title="Acceptable use">
                <LegalP>You agree not to use the Service to:</LegalP>
                <LegalList
                    items={[
                        'Violate any applicable law or regulation',
                        'Store or process data you are not authorised to handle',
                        'Probe, scan, or attack our systems or other users’ data',
                        'Circumvent role-based access, security controls, or audit controls',
                        'Send spam or abuse OTP / messaging channels',
                        'Misrepresent your identity or outlet affiliation',
                    ]}
                />
            </LegalSection>

            <LegalSection id="third-party" number="8" title="Third-party services">
                <LegalP>The Service depends on third-party infrastructure and providers, which may include:</LegalP>
                <LegalList
                    items={[
                        'Cloud hosting, database, and authentication services',
                        'SMS OTP delivery and related telecom routes',
                        'Email delivery for email OTP and transactional messages',
                        'Push notification services',
                        'Device and operating system services (iOS, Android, and web browsers)',
                    ]}
                />
                <LegalP>
                    Your use of those providers may also be subject to their terms. We are not responsible for outages or
                    acts of third parties beyond our reasonable control, except as required by law.
                </LegalP>
            </LegalSection>

            <LegalSection id="ip" number="9" title="Intellectual property">
                <LegalP>
                    PetroFI branding, software, UI, documentation, and related materials are owned by Vitespace Private
                    Limited or its licensors. These Terms do not transfer any ownership rights to you.
                </LegalP>
            </LegalSection>

            <LegalSection id="confidentiality" number="10" title="Confidentiality">
                <LegalP>
                    Each party may receive confidential business information from the other. You agree to use our
                    confidential information only to use the Service and not to disclose it except to staff who need it
                    and are bound to protect it, or as required by law.
                </LegalP>
            </LegalSection>

            <LegalSection id="disclaimers" number="11" title="Disclaimers">
                <LegalCallout>
                    11.1. THE SERVICE IS PROVIDED <strong className="text-pf-navy">“AS IS”</strong> AND{' '}
                    <strong className="text-pf-navy">“AS AVAILABLE”</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW. WE
                    DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </LegalCallout>
                <LegalP>
                    11.2. We do not warrant that the Service will be uninterrupted, error-free, or that calculations,
                    reports, or dashboards will meet every regulatory or auditor requirement without your own verification.
                </LegalP>
                <LegalP>
                    11.3. Network connectivity, device permissions, and third-party SMS/email delivery affect OTP login
                    and sync; temporary delays or failures may occur.
                </LegalP>
            </LegalSection>

            <LegalSection id="liability" number="12" title="Limitation of liability">
                <LegalP>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</LegalP>
                <LegalP>
                    12.1. Vitespace shall not be liable for indirect, incidental, special, consequential, or punitive
                    damages, or for lost profits, lost revenue, lost data, or business interruption.
                </LegalP>
                <LegalP>
                    12.2. Vitespace’s total aggregate liability arising out of or relating to the Service or these Terms
                    shall not exceed the fees you paid to Vitespace for the Service in the{' '}
                    <strong className="text-pf-navy font-semibold">three (3) months</strong> preceding the claim (or INR
                    5,000 if no fees were paid).
                </LegalP>
                <LegalP>
                    12.3. Nothing in these Terms excludes liability that cannot be excluded under applicable law
                    (including fraud or wilful misconduct).
                </LegalP>
            </LegalSection>

            <LegalSection id="indemnity" number="13" title="Indemnity">
                <LegalP>
                    You agree to indemnify and hold harmless Vitespace and its directors, officers, and employees from
                    claims arising out of: (a) Your Content; (b) your misuse of the Service; (c) your violation of these
                    Terms or law; or (d) disputes between you and your customers, employees, or suppliers related to data
                    you enter in PetroFI.
                </LegalP>
            </LegalSection>

            <LegalSection id="termination" number="14" title="Suspension and termination">
                <LegalP>
                    14.1. You may stop using the Service at any time. Account closure or data export requests may be made
                    via the support contacts above.
                </LegalP>
                <LegalP>
                    14.2. We may suspend or terminate access for breach of Terms, non-payment, security risk, legal
                    requirement, or prolonged inactivity of an unapproved registration.
                </LegalP>
                <LegalP>
                    14.3. Upon termination, your right to use the Service ends. We may retain data as required by law,
                    for legitimate business interests (e.g. disputes, audits), or as described in the Privacy Policy.
                </LegalP>
            </LegalSection>

            <LegalSection id="changes" number="15" title="Changes to the Service and Terms">
                <LegalP>
                    We may update the Service and these Terms from time to time. Material changes will be indicated by
                    updating the “Last updated” date and, where appropriate, in-app notice or email. Continued use after
                    changes become effective constitutes acceptance.
                </LegalP>
            </LegalSection>

            <LegalSection id="governing-law" number="16" title="Governing law and disputes">
                <LegalP>
                    These Terms are governed by the laws of <strong className="text-pf-navy font-semibold">India</strong>.
                    Courts at <strong className="text-pf-navy font-semibold">Ghaziabad, Uttar Pradesh</strong> (registered
                    office jurisdiction) shall have exclusive jurisdiction, subject to any mandatory consumer or MSME
                    protections that apply to you.
                </LegalP>
            </LegalSection>

            <LegalSection id="general" number="17" title="General">
                <LegalP>17.1. If any provision is unenforceable, the remainder remains in effect.</LegalP>
                <LegalP>17.2. Failure to enforce a provision is not a waiver.</LegalP>
                <LegalP>
                    17.3. You may not assign these Terms without our consent; we may assign them in connection with a
                    merger, acquisition, or sale of assets.
                </LegalP>
                <LegalP>
                    17.4. These Terms, together with the Privacy Policy and any written commercial agreement, form the
                    entire agreement regarding the Service.
                </LegalP>
            </LegalSection>

            <LegalSection id="contact" number="18" title="Contact">
                <LegalContactCard>
                    <p className="text-base font-bold font-outfit text-pf-navy mb-1">Vitespace Private Limited</p>
                    <p className="text-sm text-slate-500 font-jakarta mb-4">Product: PetroFI</p>
                    <LegalP>Registered office: S-4/783, Shalimar Garden, Extension -1, Sahibabad, Ghaziabad</LegalP>
                    <div className="mt-4 space-y-2 text-sm font-jakarta text-slate-600">
                        <p>
                            <strong className="text-pf-navy">Email:</strong>{' '}
                            <a className="text-pf-sky hover:underline" href="mailto:admin@petrofi.in">admin@petrofi.in</a>
                            {' · '}
                            <a className="text-pf-sky hover:underline" href="mailto:petrofibusiness@gmail.com">petrofibusiness@gmail.com</a>
                        </p>
                        <p>
                            <strong className="text-pf-navy">Phone:</strong>{' '}
                            <a className="text-pf-sky hover:underline" href="tel:+917398621812">+91 7398621812</a>
                            {' · '}
                            <a className="text-pf-sky hover:underline" href="tel:+918700117495">+91 8700117495</a>
                        </p>
                    </div>
                    <p className="text-sm text-slate-600 font-jakarta mt-4">
                        For notices regarding these Terms, prefer email with subject line:{' '}
                        <strong className="text-pf-navy">“PetroFI Terms of Service”</strong>.
                    </p>
                </LegalContactCard>
                <LegalH3>Grievance Officer</LegalH3>
                <LegalP>
                    In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and
                    contact details of the Grievance Officer are provided below:
                </LegalP>
                <LegalList
                    items={[
                        { key: 'go-name', content: <><strong className="text-pf-navy font-semibold">Name:</strong> Abhinandan Srivastava</> },
                        { key: 'go-email', content: <><strong className="text-pf-navy font-semibold">Email:</strong> <a className="text-pf-sky hover:underline" href="mailto:admin@petrofi.in">admin@petrofi.in</a></> },
                    ]}
                />
                <LegalP>
                    We will acknowledge your grievance within 24 hours and aim to resolve it within 15 days.
                </LegalP>
            </LegalSection>
        </LegalPageLayout>
    );
};

export default TermsOfServicePage;
