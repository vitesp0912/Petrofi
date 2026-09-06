import React from 'react';
import LegalPageLayout, {
    LegalCallout,
    LegalContactCard,
    LegalH3,
    LegalList,
    LegalP,
    LegalSection,
    LegalTable,
} from '../components/LegalPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

const SECTIONS = [
    { id: 'who-we-are', number: '1', title: 'Who we are' },
    { id: 'scope', number: '2', title: 'Scope' },
    { id: 'information-we-collect', number: '3', title: 'Information we collect' },
    { id: 'how-we-collect', number: '4', title: 'How we collect information' },
    { id: 'why-we-use', number: '5', title: 'Why we use information' },
    { id: 'legal-bases', number: '6', title: 'Legal bases' },
    { id: 'how-we-share', number: '7', title: 'How we share information' },
    { id: 'outlet-isolation', number: '8', title: 'Outlet data isolation' },
    { id: 'international', number: '9', title: 'International / cloud processing' },
    { id: 'retention', number: '10', title: 'Data retention' },
    { id: 'security', number: '11', title: 'Security' },
    { id: 'rights', number: '12', title: 'Your choices and rights' },
    { id: 'children', number: '13', title: 'Children’s privacy' },
    { id: 'permissions', number: '14', title: 'Permissions' },
    { id: 'third-parties', number: '15', title: 'Third-party links and stores' },
    { id: 'changes', number: '16', title: 'Changes to this Policy' },
    { id: 'grievances', number: '17', title: 'Grievances / contact' },
    { id: 'summary', number: '18', title: 'Summary of data categories' },
];

const PrivacyPolicyPage = () => {
    usePageMeta({
        title: 'Privacy Policy | PetroFI',
        description:
            'How Vitespace Private Limited collects, uses, stores, and protects information in PetroFI — petrol pump management software for India.',
        canonical: 'https://www.petrofi.in/privacy-policy',
    });

    return (
        <LegalPageLayout
            eyebrow="Privacy Policy · v1.0"
            title="Privacy Policy"
            intro=""
            version="v1.0"
            effectiveDate="6 September 2026"
            lastUpdated="6 September 2026"
            controller="Vitespace Private Limited"
            sections={SECTIONS}
        >
            <LegalSection id="who-we-are" number="1" title="Who we are">
                <LegalP>
                    PetroFI is a fuel retail outlet operations and finance product of{' '}
                    <strong className="text-pf-navy font-semibold">Vitespace Private Limited</strong> (“Vitespace”, “we”,
                    “us”, or “our”). It helps authorised users manage pump setup, daily entries, inventory, treasury,
                    credit ledger, and reports.
                </LegalP>
                <LegalP>
                    Registered office: S-4/783, Shalimar Garden, Extension -1, Sahibabad, Ghaziabad
                </LegalP>
                <LegalTable
                    headers={['Channel', 'Details']}
                    rows={[
                        [
                            'Email',
                            <>
                                <a className="text-pf-sky hover:underline" href="mailto:admin@petrofi.in">admin@petrofi.in</a>
                                {', '}
                                <a className="text-pf-sky hover:underline" href="mailto:petrofibusiness@gmail.com">petrofibusiness@gmail.com</a>
                            </>,
                        ],
                        [
                            'Phone',
                            <>
                                <a className="text-pf-sky hover:underline" href="tel:+917398621812">+91 7398621812</a>
                                {', '}
                                <a className="text-pf-sky hover:underline" href="tel:+918700117495">+91 8700117495</a>
                            </>,
                        ],
                    ]}
                />
                <LegalCallout>
                    For privacy requests, email us with subject: <strong className="text-pf-navy">“PetroFI Privacy Request”</strong>.
                </LegalCallout>
            </LegalSection>

            <LegalSection id="scope" number="2" title="Scope">
                <LegalP>This Policy applies to:</LegalP>
                <LegalList
                    items={[
                        'Dealers / owners registering an outlet',
                        'Managers, FSM/field staff, and other invited users',
                        'Use of PetroFI on mobile and web',
                    ]}
                />
                <LegalP>
                    It does not govern third-party websites or services that we do not control, even if linked from the app.
                </LegalP>
            </LegalSection>

            <LegalSection id="information-we-collect" number="3" title="Information we collect">
                <LegalH3>3.1 Account and identity information</LegalH3>
                <LegalP>Depending on how you register or sign in, we may collect:</LegalP>
                <LegalList
                    items={[
                        'Full name',
                        'Mobile phone number',
                        'Email address (optional at signup; may be used for email OTP login)',
                        'Role (e.g. dealer, manager, FSM)',
                        'Authentication identifiers linked to your account',
                    ]}
                />
                <LegalP>
                    Phone and/or email OTPs are used to verify sign-in. OTP delivery may involve SMS and email service providers.
                </LegalP>

                <LegalH3>3.2 Outlet (pump) information</LegalH3>
                <LegalList
                    items={[
                        'Outlet / RO name',
                        'Address, city, state, PIN code',
                        'Outlet contact phone and email',
                        'Owner name and phone',
                        'Registration and subscription status',
                        'Configuration such as fuel types, shifts, nozzles, tanks, bank accounts, and payment modes',
                    ]}
                />

                <LegalH3>3.3 Operational and financial business data</LegalH3>
                <LegalP>Data you or your staff enter or generate in PetroFI, which may include:</LegalP>
                <LegalList
                    items={[
                        'Daily meter / nozzle readings and fuel sales',
                        'Expenses and other transactions',
                        'Digital sales and payment-mode breakdowns',
                        'Credit (udhar) customers, credit sales, and repayments',
                        'Treasury movements, cash/bank balances, money transfers',
                        'Fuel receipts, tank levels, and inventory purchases/sales',
                        'Reports you generate (e.g. PDF / Excel downloads)',
                        'Shift-linked operational records',
                    ]}
                />
                <LegalP>
                    This is primarily <strong className="text-pf-navy font-semibold">business operational data</strong>.
                    Where it includes information about your customers (e.g. credit customer name or phone), you are
                    responsible for having a lawful basis to process that data in PetroFI.
                </LegalP>

                <LegalH3>3.4 Device, app, and technical data</LegalH3>
                <LegalList
                    items={[
                        'Device push notification tokens used to deliver alerts',
                        'App version and basic device/platform information as needed for updates and support',
                        'Connectivity-related signals used for offline/online handling',
                        'Local preferences stored on your device for settings and display continuity',
                        'Security session data (authentication tokens used to keep you signed in)',
                    ]}
                />

                <LegalH3>3.5 Audit and diagnostics</LegalH3>
                <LegalList
                    items={[
                        'Audit / activity logs of significant actions (e.g. create/update/login-related events) for accountability and support',
                        'Error and diagnostic logs that may include limited technical details needed to investigate failures',
                    ]}
                />

                <LegalH3>3.6 Information we do not intentionally collect</LegalH3>
                <LegalP>
                    We do not require government ID scans, precise continuous GPS tracking, or payment card PAN storage
                    as part of core PetroFI features, unless you separately upload such material or we introduce a feature
                    with its own notice.
                </LegalP>
            </LegalSection>

            <LegalSection id="how-we-collect" number="4" title="How we collect information">
                <LegalList
                    items={[
                        { key: 'direct', content: <><strong className="text-pf-navy font-semibold">Directly from you</strong> — signup, profile, settings, and day-to-day entries</> },
                        { key: 'invited', content: <><strong className="text-pf-navy font-semibold">From invited users</strong> — when a dealer invites staff</> },
                        { key: 'auto', content: <><strong className="text-pf-navy font-semibold">Automatically</strong> — auth sessions, device tokens, logs, and app diagnostics</> },
                        { key: 'providers', content: <><strong className="text-pf-navy font-semibold">From service providers</strong> — e.g. delivery status of SMS/email OTP where provided to us</> },
                    ]}
                />
            </LegalSection>

            <LegalSection id="why-we-use" number="5" title="Why we use information (purposes)">
                <LegalP>We process information to:</LegalP>
                <LegalTable
                    headers={['Purpose', 'Examples']}
                    rows={[
                        ['Provide the Service', 'Login, pump-scoped dashboards, entries, stock, treasury, reports'],
                        ['Account administration', 'Registration approval, roles, invites, access control'],
                        ['Security', 'Authentication, session management, abuse prevention, audit trails'],
                        ['Notifications', 'Operational push notifications where enabled'],
                        ['Support', 'Responding to contact requests and troubleshooting'],
                        ['Improvement', 'Reliability, bug fixes, performance (using aggregated or diagnostic data where practicable)'],
                        ['Legal and compliance', 'Complying with law, enforcing Terms, resolving disputes'],
                        ['Business operations', 'Billing/subscription administration where applicable'],
                    ]}
                />
            </LegalSection>

            <LegalSection id="legal-bases" number="6" title="Legal bases (where applicable)">
                <LegalP>
                    Depending on applicable law (including India’s Digital Personal Data Protection Act, 2023, when in
                    force for your processing), we rely on one or more of:
                </LegalP>
                <LegalList
                    items={[
                        { key: 'consent', content: <><strong className="text-pf-navy font-semibold">Consent</strong> (e.g. optional email, notification permissions)</> },
                        { key: 'contract', content: <><strong className="text-pf-navy font-semibold">Performance of a contract</strong> / providing the Service you requested</> },
                        { key: 'legitimate', content: <><strong className="text-pf-navy font-semibold">Legitimate uses</strong> permitted by law (e.g. security, fraud prevention, service improvement)</> },
                        { key: 'legal', content: <><strong className="text-pf-navy font-semibold">Legal obligation</strong> when required</> },
                    ]}
                />
                <LegalP>
                    For customer personal data you enter (e.g. credit customers), <strong className="text-pf-navy font-semibold">you</strong> determine
                    the purpose and are responsible for notices/consents owed to those individuals. Vitespace processes
                    such data as a service provider / data processor on your instructions to provide PetroFI, except where
                    we must process it for our own legal obligations or security.
                </LegalP>
            </LegalSection>

            <LegalSection id="how-we-share" number="7" title="How we share information">
                <LegalP>
                    We do <strong className="text-pf-navy font-semibold">not</strong> sell your personal data.
                </LegalP>
                <LegalP>We may share information with:</LegalP>

                <LegalH3>7.1 Service providers (processors)</LegalH3>
                <LegalList
                    items={[
                        'Cloud hosting, database, and authentication services',
                        'SMS OTP delivery and related telecom intermediaries',
                        'Email delivery for email OTP and transactional mail',
                        'Push notification infrastructure',
                        'Infrastructure, analytics, or support tools we engage under confidentiality and data-processing terms',
                    ]}
                />

                <LegalH3>7.2 Within your organisation</LegalH3>
                <LegalP>
                    Users on the same approved outlet may see pump-scoped data according to their role and permissions.
                </LegalP>

                <LegalH3>7.3 Legal and safety</LegalH3>
                <LegalP>
                    If required by law, regulation, court order, or to protect rights, safety, and security of Vitespace,
                    users, or the public.
                </LegalP>

                <LegalH3>7.4 Business transfers</LegalH3>
                <LegalP>
                    In connection with a merger, acquisition, financing, or sale of assets, subject to appropriate safeguards.
                </LegalP>
            </LegalSection>

            <LegalSection id="outlet-isolation" number="8" title="Outlet data isolation and access control">
                <LegalP>
                    PetroFI is designed as a <strong className="text-pf-navy font-semibold">multi-outlet</strong> system.
                    Operational data is generally scoped to your pump/outlet. Access is restricted using authentication
                    and server-side security controls. You must still use strong device security and revoke access for
                    former staff promptly.
                </LegalP>
            </LegalSection>

            <LegalSection id="international" number="9" title="International / cloud processing">
                <LegalP>
                    Data is stored and processed on cloud infrastructure operated by our providers. Depending on provider
                    region and routing, data may be processed in India and/or other countries. We take steps we consider
                    appropriate (contractual and technical) consistent with our providers’ capabilities. Contact us if you
                    need details of the primary hosting region.
                </LegalP>
            </LegalSection>

            <LegalSection id="retention" number="10" title="Data retention">
                <LegalP>We retain information for as long as:</LegalP>
                <LegalList
                    items={[
                        'Your account / outlet subscription remains active, and',
                        'Needed to provide the Service, resolve disputes, enforce agreements, and meet legal, tax, or audit requirements',
                    ]}
                />
                <LegalP>
                    Pending or rejected registrations may be retained for review and fraud prevention. Device tokens are
                    updated or removed when you sign out, uninstall, or tokens are invalidated. Local device caches may
                    remain until cleared by the OS or app data reset.
                </LegalP>
                <LegalP>
                    On verified account closure requests, we will delete or anonymise personal data we control, except
                    where retention is required or permitted by law.
                </LegalP>
            </LegalSection>

            <LegalSection id="security" number="11" title="Security">
                <LegalP>
                    We implement technical and organisational measures appropriate to the nature of the Service, which may include:
                </LegalP>
                <LegalList
                    items={[
                        'Encrypted transport (HTTPS / TLS)',
                        'Token-based authentication sessions',
                        'Role-based access and pump-level data isolation',
                        'Server-side security controls',
                        'Audit logging of sensitive actions',
                    ]}
                />
                <LegalP>
                    No method of transmission or storage is 100% secure. You must protect OTP-capable devices and not share OTPs.
                </LegalP>
            </LegalSection>

            <LegalSection id="rights" number="12" title="Your choices and rights">
                <LegalP>Subject to applicable law, you may request to:</LegalP>
                <LegalList
                    items={[
                        { key: 'access', content: <><strong className="text-pf-navy font-semibold">Access</strong> personal data we hold about you</> },
                        { key: 'correct', content: <><strong className="text-pf-navy font-semibold">Correct</strong> inaccurate account information</> },
                        { key: 'delete', content: <><strong className="text-pf-navy font-semibold">Delete</strong> or withdraw consent where processing is consent-based</> },
                        { key: 'export', content: <><strong className="text-pf-navy font-semibold">Export</strong> certain business data (where features or support can provide it)</> },
                        { key: 'optout', content: <><strong className="text-pf-navy font-semibold">Opt out</strong> of non-essential notifications via device settings</> },
                    ]}
                />
                <LegalP>
                    Outlet owners may manage staff access through invite/deactivate flows in the product where available.
                </LegalP>
                <LegalP>
                    To exercise rights, contact the emails listed above. We may need to verify your identity and authority
                    (especially for outlet-wide data requests).
                </LegalP>
            </LegalSection>

            <LegalSection id="children" number="13" title="Children’s privacy">
                <LegalP>
                    PetroFI is a <strong className="text-pf-navy font-semibold">business</strong> application for fuel
                    retail operations. It is not directed at children under 18. We do not knowingly collect personal data
                    from children.
                </LegalP>
            </LegalSection>

            <LegalSection id="permissions" number="14" title="Permissions">
                <LegalP>Depending on platform and features, the app may request permissions such as:</LegalP>
                <LegalList
                    items={[
                        { key: 'notif', content: <><strong className="text-pf-navy font-semibold">Notifications</strong> — operational alerts</> },
                        { key: 'net', content: <><strong className="text-pf-navy font-semibold">Network access</strong> — sync and authentication</> },
                        { key: 'storage', content: <><strong className="text-pf-navy font-semibold">Storage / files</strong> — saving or sharing reports (PDF/Excel)</> },
                        'Other OS permissions required for sharing or opening files',
                    ]}
                />
                <LegalP>You can deny optional permissions; some features may not work without them.</LegalP>
            </LegalSection>

            <LegalSection id="third-parties" number="15" title="Third-party links and stores">
                <LegalP>
                    App Store / Play Store distribution and payment (if any) are also governed by Apple/Google terms.
                    Third-party links open external services with their own privacy practices.
                </LegalP>
            </LegalSection>

            <LegalSection id="changes" number="16" title="Changes to this Policy">
                <LegalP>
                    We may update this Privacy Policy from time to time. The “Last updated” date will change, and material
                    updates may be communicated in-app or by email where appropriate. Continued use after the effective
                    date of changes means you acknowledge the updated Policy.
                </LegalP>
            </LegalSection>

            <LegalSection id="grievances" number="17" title="Grievances / contact">
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
                        For privacy requests, prefer email with subject line:{' '}
                        <strong className="text-pf-navy">“PetroFI Privacy Request”</strong>.
                    </p>
                </LegalContactCard>
                <LegalP>
                    <strong className="text-pf-navy font-semibold">Grievance Officer:</strong> In accordance with the
                    Information Technology Act, 2000 and rules made thereunder (including the Information Technology
                    (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021), the name and contact details of
                    the Grievance Officer are provided below:
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
                <LegalP>
                    If you have an unresolved privacy concern, contact us first. You may also have the right to approach
                    the relevant data protection authority under applicable Indian law once fully operational for your
                    category of processing.
                </LegalP>
            </LegalSection>

            <LegalSection id="summary" number="18" title="Summary of data categories">
                <LegalTable
                    headers={['Category', 'Examples in PetroFI', 'Typical use']}
                    rows={[
                        ['Identity', 'Name, phone, email, account identifiers', 'Login, roles, support'],
                        ['Outlet', 'RO name, address, configuration', 'Multi-outlet operations'],
                        ['Operations', 'Readings, sales, expenses, stock', 'Core product features'],
                        ['Credit customers', 'Name/phone/balances you enter', 'Udhar ledger'],
                        ['Money movement', 'Treasury, banks, transfers', 'Funds tracking'],
                        ['Device', 'Push notification tokens, local preferences', 'Notifications, settings'],
                        ['Logs', 'Audit / error logs', 'Security and support'],
                    ]}
                />
                <p className="text-xs text-slate-400 font-jakarta italic pt-2">End of Privacy Policy.</p>
            </LegalSection>
        </LegalPageLayout>
    );
};

export default PrivacyPolicyPage;
