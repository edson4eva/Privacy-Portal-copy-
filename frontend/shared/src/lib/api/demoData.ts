import inboxEnvelope from '../app-side-menu/icons/inbox-envelope.svg';

/**
 * Canned API responses used only when NX_PUBLIC_DEMO_MODE is enabled, so the
 * account history screens can be walked through without the AccessedServices
 * API. Category ids come from Categories in
 * ../accessed-service-details/types/Constants so the search filter matches.
 *
 * This is illustrative sample data, not anyone's real service history.
 */

interface DemoAccessedService {
    id: string;
    serviceName: string;
    categoryId: string;
    lastAccessedOn: string;
    isAvailable: boolean;
    description: string;
    dataOwnerTexts: string[];
    /** Overrides the default FOIP statement where a different authority applies. */
    privacyAuthority?: string;
}

/** Days back from now, so the list always looks recently active. */
const daysAgo = (days: number, hour: number, minute: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
};

const DEMO_ACCESSED_SERVICES: DemoAccessedService[] = [
    {
        id: 'alberta-wallet',
        serviceName: 'Alberta Wallet',
        categoryId: 'permits-Records-government-services',
        lastAccessedOn: daysAgo(1, 15, 30),
        isAvailable: true,
        description:
            'Added a government-issued digital credential to the Alberta Wallet and reviewed the credentials already held.',
        dataOwnerTexts: ['Technology and Innovation'],
    },
    {
        id: 'canada-revenue-agency',
        serviceName: 'Canada Revenue Agency',
        categoryId: 'family-and-social-support',
        lastAccessedOn: daysAgo(1, 8, 14),
        isAvailable: true,
        description:
            'Confirmed income and residency information held by the Canada Revenue Agency to assess eligibility for an income-tested Alberta benefit.',
        dataOwnerTexts: ['Treasury Board and Finance'],
        privacyAuthority:
            'This information is held by the Canada Revenue Agency and was shared with the Government of Alberta under an information-sharing agreement, as permitted by the Income Tax Act and the Freedom of Information and Protection of Privacy Act.',
    },
    {
        id: 'alberta-energy-rebate',
        serviceName: 'Alberta Energy Rebate',
        categoryId: 'family-and-social-support',
        lastAccessedOn: daysAgo(1, 10, 26),
        isAvailable: true,
        description:
            'Checked eligibility for the Alberta Energy Rebate and reviewed the credits applied to a household utility account.',
        dataOwnerTexts: ['Treasury Board and Finance'],
    },
    {
        id: 'drivers-licence-renewal',
        serviceName: "Driver's licence renewal",
        categoryId: 'driving-and-vehicles',
        lastAccessedOn: daysAgo(3, 9, 42),
        isAvailable: true,
        description:
            "Renewed an Alberta operator's licence, including the vision declaration and updated photo.",
        dataOwnerTexts: ['Service Alberta and Red Tape Reduction', 'Alberta Transportation and Economic Corridors'],
    },
    {
        id: 'id-card-renewal',
        serviceName: 'Alberta identification card renewal',
        categoryId: 'permits-Records-government-services',
        lastAccessedOn: daysAgo(8, 14, 5),
        isAvailable: true,
        description: 'Renewed a provincial identification card for a non-driver.',
        dataOwnerTexts: ['Service Alberta and Red Tape Reduction'],
    },
    {
        id: 'vehicle-registration-renewal',
        serviceName: 'Vehicle registration renewal',
        categoryId: 'driving-and-vehicles',
        lastAccessedOn: daysAgo(11, 8, 17),
        isAvailable: true,
        description: 'Renewed the registration for a passenger vehicle and received an updated certificate.',
        dataOwnerTexts: ['Alberta Transportation and Economic Corridors'],
    },
    {
        id: 'parking-fine-payment',
        serviceName: 'Paid a parking fine',
        categoryId: 'justice',
        lastAccessedOn: daysAgo(16, 19, 51),
        isAvailable: true,
        description: 'Paid an outstanding parking violation and received a payment confirmation.',
        dataOwnerTexts: ['Alberta Justice'],
    },
    {
        id: 'speeding-fine-payment',
        serviceName: 'Paid a speeding fine',
        categoryId: 'justice',
        lastAccessedOn: daysAgo(23, 11, 9),
        isAvailable: true,
        description: 'Paid a traffic violation ticket issued under the Traffic Safety Act.',
        dataOwnerTexts: ['Alberta Justice', 'Alberta Transportation and Economic Corridors'],
    },
    {
        id: 'development-permit-renewal',
        serviceName: 'Development permit renewal',
        categoryId: 'permits-Records-government-services',
        lastAccessedOn: daysAgo(29, 10, 33),
        isAvailable: true,
        description: 'Renewed a development permit for a residential property improvement.',
        dataOwnerTexts: ['Municipal Affairs'],
    },
    {
        id: 'health-care-card-update',
        serviceName: 'Alberta Health Care Insurance Plan update',
        categoryId: 'health',
        lastAccessedOn: daysAgo(35, 13, 24),
        isAvailable: true,
        description: 'Updated the mailing address held on an Alberta Health Care Insurance Plan record.',
        dataOwnerTexts: ['Alberta Health'],
    },
    {
        id: 'birth-certificate-order',
        serviceName: 'Ordered a birth certificate',
        categoryId: 'life-events',
        lastAccessedOn: daysAgo(44, 15, 2),
        isAvailable: true,
        description: 'Ordered a certified copy of an Alberta birth certificate.',
        dataOwnerTexts: ['Service Alberta and Red Tape Reduction'],
    },
    {
        id: 'commercial-vehicle-permit',
        serviceName: 'Commercial vehicle permit',
        categoryId: 'driving-and-vehicles',
        lastAccessedOn: daysAgo(52, 7, 46),
        isAvailable: true,
        description: 'Applied for an oversize load permit for a commercial vehicle.',
        dataOwnerTexts: ['Alberta Transportation and Economic Corridors'],
    },
    {
        id: 'marriage-certificate-order',
        serviceName: 'Ordered a marriage certificate',
        categoryId: 'life-events',
        lastAccessedOn: daysAgo(61, 16, 38),
        isAvailable: true,
        description: 'Ordered a certified copy of an Alberta marriage certificate.',
        dataOwnerTexts: ['Service Alberta and Red Tape Reduction'],
    },
    {
        id: 'employment-standards-claim',
        serviceName: 'Employment standards claim',
        categoryId: 'employment',
        lastAccessedOn: daysAgo(78, 9, 12),
        isAvailable: false,
        description: 'Filed a claim regarding unpaid wages under the Employment Standards Code.',
        dataOwnerTexts: ['Jobs, Economy, Trade and Immigration'],
    },
    {
        id: 'child-support-services',
        serviceName: 'Child support services',
        categoryId: 'family-and-social-support',
        lastAccessedOn: daysAgo(94, 12, 55),
        isAvailable: true,
        description: 'Reviewed a child support order and the associated payment schedule.',
        dataOwnerTexts: ['Alberta Justice', 'Seniors, Community and Social Services'],
    },
];

/**
 * Why each service needed the personal information it accessed. The first
 * entries are specific to the service; the shared reasons below are appended to
 * every list because they apply to any Government of Alberta service.
 */
const PRIVACY_REASONS_BY_ID: Record<string, string[]> = {
    'alberta-wallet': [
        'To confirm your identity to the level of assurance a digital credential requires',
        'To bind the credential to your verified account and the device holding it',
    ],
    'canada-revenue-agency': [
        'To confirm the income reported for the relevant tax year',
        'To verify residency for the period the benefit covers',
    ],
    'alberta-energy-rebate': [
        'To confirm the utility account and address the rebate should be applied to',
        'To verify household eligibility against the program criteria',
    ],
    'drivers-licence-renewal': [
        'To confirm your driving record and the class of licence held',
        'To check that medical and vision requirements are met before renewal',
    ],
    'id-card-renewal': [
        'To confirm your identity and Alberta residency before issuing a card',
        'To match your record against the existing identification file',
    ],
    'vehicle-registration-renewal': [
        'To confirm registered ownership of the vehicle',
        'To verify that valid insurance is in place',
    ],
    'parking-fine-payment': [
        'To locate the violation notice issued against your vehicle',
        'To apply and receipt your payment against the correct file',
    ],
    'speeding-fine-payment': [
        'To locate the traffic ticket issued under the Traffic Safety Act',
        'To record the disposition of the ticket against your driving record',
    ],
    'development-permit-renewal': [
        'To confirm you are the owner or authorized applicant for the property',
        'To assess the application against land use and zoning requirements',
    ],
    'health-care-card-update': [
        'To confirm your identity before amending your health record',
        'To keep your coverage and correspondence details accurate',
    ],
    'birth-certificate-order': [
        'To confirm your entitlement to receive the record requested',
        'To locate the correct registration in the vital statistics register',
    ],
    'commercial-vehicle-permit': [
        'To verify the carrier profile and safety fitness rating',
        'To assess the load and route against permit conditions',
    ],
    'marriage-certificate-order': [
        'To confirm your entitlement to receive the record requested',
        'To locate the correct registration in the vital statistics register',
    ],
    'employment-standards-claim': [
        'To identify the employer and employment period your claim concerns',
        'To investigate the claim and contact the parties involved',
    ],
    'child-support-services': [
        'To identify the support order and the parties named in it',
        'To calculate and reconcile payments owed and received',
    ],
};

const SHARED_PRIVACY_REASONS: string[] = [
    'To verify your identity so information is released only to you',
    'To keep a record of the transaction, as required for government recordkeeping',
    'To detect and prevent fraud or misuse of the service',
    'To contact you if there is a problem with your request',
];

const privacyDetailsContent = (service: DemoAccessedService): string => {
    const reasons = [...(PRIVACY_REASONS_BY_ID[service.id] ?? []), ...SHARED_PRIVACY_REASONS];

    return [
        '<p>This service used your personal information for the following reasons:</p>',
        '<ul>',
        ...reasons.map((reason) => `<li>${reason}</li>`),
        '</ul>',
        `<p>${
            service.privacyAuthority ??
            'Collection and use of this information is authorized under the Freedom of Information and ' +
                `Protection of Privacy Act. It is held by ${service.dataOwnerTexts.join(' and ')}.`
        }</p>`,
    ].join('');
};

/** Several visits per service, so the detail page has a history to show. */
const accessedDatesFor = (service: DemoAccessedService): string[] => {
    const last = new Date(service.lastAccessedOn);
    return [0, 47, 121, 219].map((offset) => {
        const date = new Date(last);
        date.setDate(date.getDate() - offset);
        return date.toISOString();
    });
};

const listResponse = () => ({
    isStale: false,
    // The table leaves rows in the order the API returned them until a sort is
    // chosen, so return them most recently accessed first.
    accessedServices: [...DEMO_ACCESSED_SERVICES]
        .sort((a, b) => new Date(b.lastAccessedOn).getTime() - new Date(a.lastAccessedOn).getTime())
        .map(({ id, serviceName, categoryId, lastAccessedOn, isAvailable }) => ({
            id,
            serviceName,
            categoryId,
            lastAccessedOn,
            isAvailable,
        })),
});

const detailResponse = (id: string) => {
    const service = DEMO_ACCESSED_SERVICES.find((entry) => entry.id === id);
    if (!service) {
        return undefined;
    }

    return {
        accessedServiceDetails: {
            accessedDates: accessedDatesFor(service),
            serviceDetails: {
                id: service.id,
                serviceName: service.serviceName,
                isAvailable: service.isAvailable,
                showOnUI: true,
                categoryId: service.categoryId,
                categoryText: service.categoryId,
                dataOwnerIds: service.dataOwnerTexts.map((_, index) => `owner-${index + 1}`),
                dataOwnerTexts: service.dataOwnerTexts,
                description: service.description,
                showMockInDev: true,
                sections: [
                    { title: 'Privacy Details', content: privacyDetailsContent(service) },
                    { title: 'What was accessed', content: service.description },
                    {
                        title: 'Why it was accessed',
                        content:
                            'The service needed to confirm your identity and eligibility before completing your request.',
                    },
                    {
                        title: 'Who holds this information',
                        content: service.dataOwnerTexts.join(', '),
                    },
                ],
            },
        },
    };
};

/**
 * Returns a canned response for a demo-supported endpoint, or undefined when
 * the caller should fall through to the real request.
 */
export const getDemoResponse = (url: string): unknown | undefined => {
    // Tolerate the /v1/preview/... variants and any leading slash.
    const path = url.replace(/^\/+/, '').replace(/^v1\//, '').replace(/^preview\//, '');

    if (path === 'accessed-services') {
        return listResponse();
    }

    if (path === 'personal-information') {
        return { personalInformation: DEMO_PERSONAL_INFORMATION };
    }

    if (path === 'identification') {
        return { identification: DEMO_IDENTIFICATION };
    }

    if (path === 'wallet') {
        return { wallet: DEMO_WALLET };
    }

    if (path === 'payment-preferences') {
        return { paymentPreferences: DEMO_PAYMENT_PREFERENCES };
    }

    if (path === 'security-settings') {
        return { securitySettings: DEMO_SECURITY_SETTINGS };
    }

    if (path === 'account-activity') {
        return { accountActivity: { events: buildDemoActivity() } };
    }

    if (path === 'inbox') {
        return { inbox: { programs: DEMO_INBOX_PROGRAMS, messages: DEMO_INBOX_MESSAGES } };
    }

    const detailMatch = /^accessed-services\/(.+)$/.exec(path);
    if (detailMatch) {
        return detailResponse(decodeURIComponent(detailMatch[1]));
    }

    return undefined;
};

/**
 * Personal information shown on the account's personal information page. The
 * real values would come from the Alberta.ca Account profile service, which is
 * not part of this repository, so demo mode answers with a representative
 * profile instead.
 */
const DEMO_PERSONAL_INFORMATION = {
    identity: {
        legalName: 'Demo User',
        preferredName: 'Demo',
        dateOfBirth: '1985-04-12',
    },
    contact: {
        email: 'demo.user@example.com',
        emailVerified: true,
        phone: '(780) 555-0142',
        phoneVerified: false,
    },
    address: {
        street: '123 Jasper Avenue NW',
        unit: 'Suite 400',
        city: 'Edmonton',
        province: 'Alberta',
        postalCode: 'T5J 0R2',
    },
    account: {
        accountType: 'Personal',
        verificationLevel: 'Verified',
        lastUpdated: '2026-07-18',
    },
};

/**
 * Identity card details shown on the My identification page. These come from
 * the identification a holder verified their account with, so the real values
 * would be supplied by the Alberta.ca Account identity service, which is not
 * part of this repository. Demo mode answers with the same fictional profile
 * used elsewhere - never a real person's name, address or licence number.
 */
const DEMO_IDENTIFICATION = {
    isVerifiedAccount: true,
    cardType: 'Alberta identification',
    card: {
        nameOnCard: 'Demo Alexander USER',
        mailingAddressLines: ['123 Jasper Avenue NW', 'Edmonton, Alberta T5J 0R2'],
        dateOfBirth: '1985-04-12',
        sex: 'Male',
        documentLabel: "Alberta driver's licence",
        documentNumber: '412887-355',
        expiryDate: '2030-04-12',
    },
};

/**
 * Documents held in the Alberta Wallet. The real wallet is issued and presented
 * through the mobile app, so these values would come from the wallet service,
 * which is not part of this repository. Demo mode answers with the same
 * fictional profile used elsewhere - never a real health number.
 */
const DEMO_WALLET = {
    documents: [
        {
            id: 'mobile-health-card',
            documentType: 'Mobile Health Card',
            personalHealthNumber: '54321-8807',
            nameOnCard: 'USER, Demo Alexander',
            birthdate: '1985-04-12',
            expiryDate: '2030-04-12',
        },
    ],
};

/**
 * Direct deposit details shown on the Payment preferences page. Real values
 * would come from the payment service, which is not part of this repository,
 * so demo mode answers with a fictional account - never real banking details.
 * Only the last four digits of an account number are ever held here.
 */
const DEMO_PAYMENT_PREFERENCES = {
    accounts: [
        {
            id: 'direct-deposit-1',
            method: 'Direct deposit',
            isInteracVerified: true,
            accountHolder: 'USER, Demo Alexander',
            bankInstitution: '000 ABC Bank of Canada',
            branchTransit: '52369',
            accountNumberLast4: '8563',
            retrievedOn: '2026-07-02T14:33:00.000Z',
        },
    ],
};

/**
 * Sign-in and recovery details shown on the Security settings page. Real values
 * come from the Alberta.ca Account, which is not part of this repository. No
 * password is ever returned by an API - the page renders a fixed mask - so only
 * its length is described here.
 */
const DEMO_SECURITY_SETTINGS = {
    twoStepVerificationEnabled: false,
    signInEmail: 'demo.user@example.com',
    recoveryEmail: undefined as string | undefined,
    expiryReminderEnabled: false,
};

/**
 * Account activity history. Real events come from the Alberta.ca Account audit
 * log, which is not part of this repository, so demo mode generates a run of
 * plausible events - enough of them that paging through the table is real.
 */
interface DemoActivityEvent {
    id: string;
    event: string;
    method?: string;
    status: 'Successful' | 'Failed';
    occurredAt: string;
    ipAddress: string;
    location: string;
    device: string;
    deviceDetail: string;
}

const DEMO_ACTIVITY_DEVICES = [
    { device: 'Windows NT 10.0, Chrome', deviceDetail: 'Unknown' },
    { device: 'macOS 14.4, Safari', deviceDetail: 'Unknown' },
    { device: 'Android 14, Chrome', deviceDetail: 'Pixel 8' },
    { device: 'iOS 17.4, Safari', deviceDetail: 'iPhone' },
];

const DEMO_ACTIVITY_ORIGINS = [
    { ipAddress: '142.229.84.78', location: 'Edmonton' },
    { ipAddress: '142.229.84.68', location: 'Edmonton' },
    { ipAddress: '142.229.148.138', location: 'Edmonton' },
    { ipAddress: '198.161.92.14', location: 'Calgary' },
];

const buildDemoActivity = (): DemoActivityEvent[] => {
    const events: DemoActivityEvent[] = [];
    const start = new Date();

    for (let index = 0; index < 70; index++) {
        // Walk backwards from now in uneven steps so the history looks lived in.
        const occurredAt = new Date(start);
        occurredAt.setHours(start.getHours() - index * 7 - (index % 5) * 3);
        occurredAt.setMinutes((index * 13) % 60, 0, 0);

        const origin = DEMO_ACTIVITY_ORIGINS[index % DEMO_ACTIVITY_ORIGINS.length];
        const hardware = DEMO_ACTIVITY_DEVICES[index % 7 === 0 ? (index % DEMO_ACTIVITY_DEVICES.length) : 0];

        let event = 'Sign in';
        let method: string | undefined = 'Google';
        let status: 'Successful' | 'Failed' = 'Successful';

        if (index % 17 === 5) {
            status = 'Failed';
        } else if (index % 23 === 9) {
            event = 'Password change';
            method = undefined;
        } else if (index % 29 === 14) {
            event = 'Email update';
            method = undefined;
        }

        events.push({
            id: `activity-${index + 1}`,
            event,
            method,
            status,
            occurredAt: occurredAt.toISOString(),
            ...origin,
            ...hardware,
        });
    }

    return events;
};

/**
 * Secure messages shown on the Inbox page. These would come from the
 * Alberta.ca Account messaging service, which is not part of this repository,
 * so demo mode answers with a representative inbox. Programs carry their own
 * colour so a reader can pick one out of the list at a glance.
 */
const DEMO_INBOX_PROGRAMS = [
    { id: 'upcoming-renewals', name: 'Upcoming Renewals', colour: '#b4550a' },
    { id: 'alberta-student-aid', name: 'Alberta Student Aid', colour: '#2e5ca8' },
    { id: 'child-care-subsidy', name: 'Child Care Subsidy', colour: '#087272' },
    { id: 'alberta-rebates', name: 'Alberta Rebates', colour: '#6b4e9e' },
    { id: 'alberta-ca-account', name: 'Alberta.ca Account', colour: '#4a5568' },
    { id: 'alberta-wallet', name: 'Alberta Wallet', colour: '#0f7b3f' },
    { id: 'alberta-health-care', name: 'Alberta Health Care', colour: '#a8326e' },
];

const DEMO_INBOX_MESSAGES = [
    {
        id: 'msg-1',
        programId: 'upcoming-renewals',
        subject: "Your driver's licence expires October 5, 2026",
        preview: 'Renew online in about 10 minutes, or book a registry visit.',
        tag: 'Action required',
        isUnread: true,
        receivedAt: '2026-09-05T21:30:00.000Z',
    },
    {
        id: 'msg-2',
        programId: 'child-care-subsidy',
        subject: 'Renew your child care subsidy by September 30, 2026',
        preview: 'Your current approval period ends October 31, 2026.',
        tag: 'Action required',
        isUnread: true,
        receivedAt: '2026-09-04T14:02:00.000Z',
    },
    {
        id: 'msg-3',
        programId: 'alberta-student-aid',
        subject: 'Your 2026 to 2027 student aid application is approved',
        preview: 'Funding summary and disbursement dates are attached.',
        isUnread: true,
        receivedAt: '2026-09-03T17:47:00.000Z',
    },
    {
        id: 'msg-4',
        programId: 'alberta-rebates',
        subject: 'Alberta Energy Rebate: your August statement is available',
        preview: 'A credit of $37.14 was applied to your August utility bill.',
        isUnread: true,
        receivedAt: '2026-09-02T12:15:00.000Z',
    },
    {
        id: 'msg-5',
        programId: 'alberta-ca-account',
        subject: 'New sign-in from a new device',
        preview: 'Chrome on Windows, Calgary AB. If this was not you, secure your account.',
        receivedAt: '2026-09-01T03:21:00.000Z',
    },
    {
        id: 'msg-6',
        programId: 'alberta-health-care',
        subject: 'Your Alberta Health Care Insurance Plan card has been mailed',
        preview: 'Allow 10 business days for delivery to your address on file.',
        receivedAt: '2026-08-28T19:08:00.000Z',
    },
    {
        id: 'msg-7',
        programId: 'alberta-wallet',
        subject: "Your digital driver's licence is ready to add to Alberta Wallet",
        preview: 'Add it once and use it on your phone at participating locations.',
        tag: 'New feature',
        receivedAt: '2026-08-26T16:33:00.000Z',
    },
    {
        id: 'msg-8',
        programId: 'alberta-student-aid',
        subject: 'Loan repayment resumes November 1, 2026',
        preview: 'Your first payment of $184.00 is due November 30, 2026.',
        receivedAt: '2026-08-21T13:55:00.000Z',
    },
    {
        id: 'msg-9',
        programId: 'upcoming-renewals',
        subject: 'Vehicle registration expires December 14, 2026',
        preview: 'You can renew up to 3 months before the expiry date.',
        receivedAt: '2026-08-18T22:40:00.000Z',
    },
    {
        id: 'msg-10',
        programId: 'child-care-subsidy',
        subject: 'August subsidy payment sent',
        preview: '$612.00 was sent to Riverbend Early Learning Centre on your behalf.',
        tag: 'Payment',
        receivedAt: '2026-08-14T11:00:00.000Z',
    },
    {
        id: 'msg-11',
        programId: 'alberta-ca-account',
        subject: 'Verify your email address to keep getting notifications',
        preview: 'Verification link expires 7 days after it is sent.',
        receivedAt: '2026-08-11T20:12:00.000Z',
    },
    {
        id: 'msg-12',
        programId: 'alberta-rebates',
        subject: 'You may be eligible for the Alberta Child and Family Benefit',
        preview: 'Eligibility is based on your family income reported to the CRA.',
        receivedAt: '2026-08-06T14:30:00.000Z',
    },
    {
        id: 'msg-13',
        programId: 'alberta-wallet',
        subject: 'Alberta Wallet terms of use have been updated',
        preview: 'Changes take effect September 15, 2026.',
        receivedAt: '2026-07-30T18:04:00.000Z',
    },
];

/**
 * Side menu shown in demo mode. The real menu is supplied by UIAM in the
 * sign-in response, which is unavailable here, so this mirrors the Alberta.ca
 * Account structure and points the Privacy Portal entries at the apps that are
 * actually deployed alongside it.
 *
 * The entries above and below the Privacy Portal group belong to the wider
 * Alberta.ca Account application, which is not part of this repository, so they
 * are present for shape only and do not lead anywhere.
 */
export const DEMO_USER_MENU = {
    top: null,
    left: [
        {
            type: 'group',
            heading: 'Personal',
            icon: 'person',
            items: [
                { type: 'link', heading: 'Personal information', href: '/complaints/personal-information' },
                { type: 'link', heading: 'Payment preferences', href: '/complaints/payment-preferences' },
            ],
        },
        { type: 'link', heading: 'My identification', icon: 'document-text', href: '/complaints/my-identification' },
        { type: 'link', heading: 'Alberta Wallet', icon: 'wallet', href: '/complaints/alberta-wallet' },
        {
            type: 'group',
            heading: 'Privacy Portal',
            icon: 'lock-closed',
            items: [
                { type: 'link', heading: 'New privacy features', href: '/complaints/features' },
                { type: 'link', heading: 'Services accessed', href: '/account-history/' },
                { type: 'link', heading: 'Privacy complaint', href: '/complaints/file-complaint' },
            ],
        },
        { type: 'link', heading: 'Security settings', icon: 'settings', href: '/complaints/security-settings' },
        { type: 'link', heading: 'Account activity', icon: 'time', href: '/complaints/account-activity' },
        { type: 'link', heading: 'Inbox', iconSrc: inboxEnvelope, href: '/complaints/inbox' },
    ],
};
