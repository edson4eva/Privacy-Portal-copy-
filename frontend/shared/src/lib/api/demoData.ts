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

    if (path === 'service-activity') {
        return {
            serviceActivity: {
                availableFrom: DEMO_ACTIVITY_AVAILABLE_FROM,
                categories: DEMO_ACTIVITY_CATEGORIES,
                services: DEMO_ACTIVITY_SERVICES,
                events: DEMO_ACTIVITY_EVENTS,
            },
        };
    }

    const serviceMatch = /^service-activity\/(.+)$/.exec(path);
    if (serviceMatch) {
        const id = decodeURIComponent(serviceMatch[1]);
        const service = DEMO_ACTIVITY_SERVICES.find((entry) => entry.id === id);
        if (!service) {
            return undefined;
        }

        return {
            serviceActivity: {
                categories: DEMO_ACTIVITY_CATEGORIES,
                service,
                events: DEMO_ACTIVITY_EVENTS.filter((event) => event.serviceId === id),
            },
        };
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
            id: 'mobile-drivers-licence',
            documentType: "Driver's Licence",
            // Rendered as the physical card rather than a wallet summary.
            layout: 'licence',
            icon: 'car',
            primaryLabel: 'Licence number',
            primaryValue: '412887-355',
            nameOnCard: 'USER, DEMO ALEXANDER',
            addressLines: ['123 JASPER AVENUE NW', 'EDMONTON, AB  T5J 0R2'],
            licence: {
                number: '412887-355',
                class: '5',
                dateOfBirth: '1985-04-12',
                sex: 'M',
                eyes: 'BRO',
                hair: 'BRO',
                height: '178 cm',
                weight: '79 kg',
                conditions: 'NONE',
                issued: '2026-04-12',
                expires: '2030-04-12',
            },
            fields: [
                { label: 'Class', value: '5' },
                { label: 'DOB', value: '1985-04-12', isDate: true },
                { label: 'Sex', value: 'M' },
                { label: 'Eyes', value: 'BRO' },
                { label: 'Hair', value: 'BRO' },
                { label: 'Height', value: '178 cm' },
                { label: 'Weight', value: '79 kg' },
                { label: 'Cond/End', value: 'NONE' },
                { label: 'Issued', value: '2026-04-12', isDate: true },
                { label: 'Expiry date', value: '2030-04-12', isDate: true },
            ],
        },
        {
            id: 'mobile-health-card',
            documentType: 'Mobile Health Card',
            icon: 'pulse',
            primaryLabel: 'Personal health number',
            primaryValue: '54321-8807',
            nameOnCard: 'USER, Demo Alexander',
            fields: [
                { label: 'Birthdate', value: '1985-04-12', isDate: true },
                { label: 'Expiry date', value: '2030-04-12', isDate: true },
            ],
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
        from: 'Alberta Transportation and Economic Corridors',
    },
    {
        id: 'msg-2',
        programId: 'child-care-subsidy',
        subject: 'Renew your child care subsidy by September 30, 2026',
        preview: 'Your current approval period ends October 31, 2026.',
        tag: 'Action required',
        isUnread: true,
        receivedAt: '2026-09-04T14:02:00.000Z',
        from: 'Children and Family Services',
        referenceNumber: 'CCS-2026-448193',
        respondBy: '2026-09-30',
        greeting: 'Hello Demo,',
        paragraphs: [
            'Your child care subsidy approval period ends on October 31, 2026. To keep receiving the subsidy without a gap in payments, renew your application by September 30, 2026.',
        ],
        callout: {
            title: '24 days left to renew',
            text: 'If you renew after September 30, your October payment may be delayed and you may be responsible for the full child care fee until your renewal is approved.',
        },
        sections: [
            {
                heading: 'What you will need',
                bullets: [
                    'Your 2025 Notice of Assessment from the Canada Revenue Agency',
                    "Your current child care arrangement, including your provider's licence number",
                    'Employment, education or training details for each parent in the household',
                ],
            },
            {
                heading: 'What happens next',
                paragraphs: [
                    'Most renewals are reviewed within 10 business days. We will send a message to this inbox when a decision is made, and your updated approval letter will appear under My documents.',
                    'If your household income, custody arrangement or child care provider has changed, report the change in the same form so your subsidy amount is calculated correctly.',
                ],
            },
        ],
        actions: [
            { label: 'Renew subsidy', kind: 'primary' },
            { label: 'Report a change', kind: 'secondary' },
        ],
        attachment: { name: 'Current approval letter (PDF)', meta: 'PDF, 184 KB - issued November 1, 2025' },
        relatedLinks: [
            'Child care subsidy eligibility and rates',
            'Find a licensed child care provider',
            'Alberta Child and Family Benefit',
        ],
        help: {
            name: 'Child Care Connect',
            lines: ['310-0000 toll free, then 780-644-9992', 'Monday to Friday, 8:15 am to 4:30 pm'],
            contactLabel: 'Contact Children and Family Services',
        },
    },
    {
        id: 'msg-3',
        programId: 'alberta-student-aid',
        subject: 'Your 2026 to 2027 student aid application is approved',
        preview: 'Funding summary and disbursement dates are attached.',
        isUnread: true,
        receivedAt: '2026-09-03T17:47:00.000Z',
        from: 'Alberta Student Aid',
    },
    {
        id: 'msg-4',
        programId: 'alberta-rebates',
        subject: 'Alberta Energy Rebate: your August statement is available',
        preview: 'A credit of $37.14 was applied to your August utility bill.',
        isUnread: true,
        receivedAt: '2026-09-02T12:15:00.000Z',
        from: 'Energy and Minerals',
    },
    {
        id: 'msg-5',
        programId: 'alberta-ca-account',
        subject: 'New sign-in from a new device',
        preview: 'Chrome on Windows, Calgary AB. If this was not you, secure your account.',
        receivedAt: '2026-09-01T03:21:00.000Z',
        from: 'Alberta.ca Account',
    },
    {
        id: 'msg-6',
        programId: 'alberta-health-care',
        subject: 'Your Alberta Health Care Insurance Plan card has been mailed',
        preview: 'Allow 10 business days for delivery to your address on file.',
        receivedAt: '2026-08-28T19:08:00.000Z',
        from: 'Alberta Health',
    },
    {
        id: 'msg-7',
        programId: 'alberta-wallet',
        subject: "Your digital driver's licence is ready to add to Alberta Wallet",
        preview: 'Add it once and use it on your phone at participating locations.',
        tag: 'New feature',
        receivedAt: '2026-08-26T16:33:00.000Z',
        from: 'Technology and Innovation',
    },
    {
        id: 'msg-8',
        programId: 'alberta-student-aid',
        subject: 'Loan repayment resumes November 1, 2026',
        preview: 'Your first payment of $184.00 is due November 30, 2026.',
        receivedAt: '2026-08-21T13:55:00.000Z',
        from: 'Alberta Student Aid',
    },
    {
        id: 'msg-9',
        programId: 'upcoming-renewals',
        subject: 'Vehicle registration expires December 14, 2026',
        preview: 'You can renew up to 3 months before the expiry date.',
        receivedAt: '2026-08-18T22:40:00.000Z',
        from: 'Alberta Transportation and Economic Corridors',
    },
    {
        id: 'msg-10',
        programId: 'child-care-subsidy',
        subject: 'August subsidy payment sent',
        preview: '$612.00 was sent to Riverbend Early Learning Centre on your behalf.',
        tag: 'Payment',
        receivedAt: '2026-08-14T11:00:00.000Z',
        from: 'Children and Family Services',
    },
    {
        id: 'msg-11',
        programId: 'alberta-ca-account',
        subject: 'Verify your email address to keep getting notifications',
        preview: 'Verification link expires 7 days after it is sent.',
        receivedAt: '2026-08-11T20:12:00.000Z',
        from: 'Alberta.ca Account',
    },
    {
        id: 'msg-12',
        programId: 'alberta-rebates',
        subject: 'You may be eligible for the Alberta Child and Family Benefit',
        preview: 'Eligibility is based on your family income reported to the CRA.',
        receivedAt: '2026-08-06T14:30:00.000Z',
        from: 'Treasury Board and Finance',
    },
    {
        id: 'msg-13',
        programId: 'alberta-wallet',
        subject: 'Alberta Wallet terms of use have been updated',
        preview: 'Changes take effect September 15, 2026.',
        receivedAt: '2026-07-30T18:04:00.000Z',
        from: 'Technology and Innovation',
    },
];

/**
 * Service activity: the services a holder has used, and the individual
 * activities recorded against them. Real data comes from the AccessedServices
 * API, which is not part of this repository, so demo mode answers with a
 * representative history.
 *
 * Two taxonomies are in play and are deliberately kept apart. A service has a
 * subject category, which is what the detail page shows beside the ministry. An
 * activity has a kind - a payment, an application, a use of personal
 * information, an account event - which is what the list filters and columns
 * show.
 */
const DEMO_ACTIVITY_CATEGORIES = [
    { id: 'applications', label: 'Applications' },
    { id: 'payments', label: 'Payments' },
    { id: 'personal-information', label: 'Personal information' },
    { id: 'account-activity', label: 'Account activity' },
];

/** Activity is only recorded for participating services from this date. */
const DEMO_ACTIVITY_AVAILABLE_FROM = '2024-07-24';

const DEMO_ACTIVITY_SERVICES = [
    {
        id: 'alberta-energy-rebate',
        name: 'Alberta Energy Rebate',
        description:
            'This online service can be used to get $600 to help with the cost of everyday essentials for eligible Albertans.',
        descriptionLinkText: 'eligible Albertans',
        categoryId: 'family-and-social-support',
        categoryLabel: 'Family and Social Support',
        ministry: 'Energy and Minerals',
        accessServiceUrl: 'https://www.alberta.ca/affordability-action-plan',
        detailsAvailable: true,
        personalInformation: [
            'Name',
            'Date of birth',
            'Marital status',
            'Social Insurance Number',
            "Co-applicant (other spouse/common-law partner) information",
            'Household income and finances',
            'Payment information',
            'Email address',
        ],
        howPersonalInformationIsUsed:
            'This information is used to determine eligibility and rebate amounts, and to issue payments to Albertans who qualify.',
        legislation: {
            summary:
                'This legislation gives the legal authority that allows the service to collect your personal information.',
            label: 'FOIP',
            url: 'https://www.alberta.ca/freedom-of-information-and-protection-of-privacy',
        },
    },
    {
        id: 'fine-payments',
        name: 'Fine payments',
        description: 'Pay violation tickets, notices of conviction and time to pay notices.',
        categoryId: 'justice',
        categoryLabel: 'Justice',
        ministry: 'Justice and Solicitor General',
        accessServiceUrl: 'https://www.alberta.ca/pay-a-fine',
        // No service details published yet, so the page says so rather than
        // showing an empty section.
        detailsAvailable: false,
    },
    {
        id: 'alberta-ca-account',
        name: 'Alberta.ca Account',
        description: 'Sign in once to reach the Government of Alberta services that use an Alberta.ca Account.',
        categoryId: 'permits-Records-government-services',
        categoryLabel: 'Permits, Records & Government Services',
        ministry: 'Service Alberta and Red Tape Reduction',
        accessServiceUrl: 'https://account.alberta.ca',
        detailsAvailable: true,
        personalInformation: ['Name', 'Date of birth', 'Email address', 'Phone number', 'Identity document details'],
        howPersonalInformationIsUsed:
            'This information is used to confirm who you are when you sign in, and to keep your account secure.',
        legislation: {
            summary:
                'This legislation gives the legal authority that allows the service to collect your personal information.',
            label: 'FOIP',
            url: 'https://www.alberta.ca/freedom-of-information-and-protection-of-privacy',
        },
    },
    {
        id: 'child-care-subsidy',
        name: 'Child care subsidy',
        description: 'Apply for help with the cost of licensed child care.',
        categoryId: 'family-and-social-support',
        categoryLabel: 'Family and Social Support',
        ministry: 'Children and Family Services',
        accessServiceUrl: 'https://www.alberta.ca/child-care-subsidy',
        detailsAvailable: false,
    },
];

const DEMO_ACTIVITY_EVENTS = [
    {
        id: 'act-1',
        serviceId: 'alberta-energy-rebate',
        event: 'Your rebate payment was issued',
        categoryId: 'payments',
        occurredAt: '2026-09-03T15:12:00.000Z',
        details: [
            { label: 'Amount', value: '$600.00' },
            { label: 'Payment method', value: 'Direct transfer' },
            { label: 'Email', value: 'demo.user@example.com' },
            { label: 'Status', value: 'Deposited' },
        ],
    },
    {
        id: 'act-2',
        serviceId: 'fine-payments',
        event: 'You paid for a fine',
        categoryId: 'payments',
        occurredAt: '2026-08-28T18:40:00.000Z',
        details: [
            { label: 'Amount', value: '$155.00' },
            { label: 'Payment method', value: 'Credit card' },
            { label: 'Status', value: 'Completed' },
        ],
    },
    {
        id: 'act-3',
        serviceId: 'alberta-energy-rebate',
        event: 'Your application was assessed automatically',
        categoryId: 'applications',
        occurredAt: '2026-08-28T13:05:00.000Z',
        details: [
            { label: 'Outcome', value: 'Approved' },
            { label: 'Assessed by', value: 'Automated eligibility check' },
        ],
    },
    {
        id: 'act-4',
        serviceId: 'alberta-energy-rebate',
        event: 'Your 2025 income information was received from CRA',
        categoryId: 'personal-information',
        occurredAt: '2026-08-27T16:20:00.000Z',
        details: [
            { label: 'Received from', value: 'Canada Revenue Agency' },
            { label: 'Information', value: 'Total income for the 2025 tax year' },
            { label: 'Used for', value: 'Confirming rebate eligibility' },
        ],
    },
    {
        id: 'act-5',
        serviceId: 'alberta-ca-account',
        event: 'Your identity document was verified',
        categoryId: 'account-activity',
        occurredAt: '2026-08-27T14:02:00.000Z',
        details: [
            { label: 'Document', value: "Alberta driver's licence" },
            { label: 'Verified by', value: 'Alberta registry agent' },
            { label: 'Result', value: 'Verified' },
        ],
    },
    {
        id: 'act-6',
        serviceId: 'alberta-energy-rebate',
        event: 'You gave consent to verify your income',
        categoryId: 'personal-information',
        occurredAt: '2026-08-27T11:48:00.000Z',
        details: [
            { label: 'Consent given for', value: 'Income verification with the Canada Revenue Agency' },
            { label: 'Consent given on', value: 'August 27, 2026' },
        ],
    },
    {
        id: 'act-7',
        serviceId: 'alberta-energy-rebate',
        event: 'You submitted your application',
        categoryId: 'applications',
        occurredAt: '2026-08-24T17:30:00.000Z',
        details: [
            { label: 'Reference number', value: 'AER-2026-771254' },
            { label: 'Status', value: 'Submitted' },
        ],
    },
    {
        id: 'act-8',
        serviceId: 'alberta-ca-account',
        event: 'You signed in from a new device',
        categoryId: 'account-activity',
        occurredAt: '2026-08-22T02:14:00.000Z',
        details: [
            { label: 'Device', value: 'Chrome on Windows' },
            { label: 'Location', value: 'Edmonton, AB' },
        ],
    },
    {
        id: 'act-9',
        serviceId: 'child-care-subsidy',
        event: 'Your subsidy payment was sent to your provider',
        categoryId: 'payments',
        occurredAt: '2026-08-14T11:00:00.000Z',
        details: [
            { label: 'Amount', value: '$612.00' },
            { label: 'Paid to', value: 'Riverbend Early Learning Centre' },
            { label: 'Status', value: 'Completed' },
        ],
    },
    {
        id: 'act-10',
        serviceId: 'child-care-subsidy',
        event: 'You submitted your renewal application',
        categoryId: 'applications',
        occurredAt: '2026-08-02T19:25:00.000Z',
        details: [
            { label: 'Reference number', value: 'CCS-2026-448193' },
            { label: 'Status', value: 'Submitted' },
        ],
    },
    {
        id: 'act-11',
        serviceId: 'alberta-ca-account',
        event: 'Your email address was updated',
        categoryId: 'account-activity',
        occurredAt: '2026-07-28T20:41:00.000Z',
        details: [{ label: 'Changed to', value: 'demo.user@example.com' }],
    },
    {
        id: 'act-12',
        serviceId: 'fine-payments',
        event: 'Your payment receipt was issued',
        categoryId: 'payments',
        occurredAt: '2026-07-19T15:06:00.000Z',
        details: [
            { label: 'Receipt number', value: 'FP-2026-9981' },
            { label: 'Amount', value: '$155.00' },
        ],
    },
];

/**
 * The account stood in for while demo mode is on. Held here with the menu it
 * carries so the auth provider and the sign-in route use the same one.
 */
export const DEMO_USER = {
    name: 'Demo User',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo.user@example.com',
    profile: 'personal',
    businessName: undefined,
    isVerified: true,
    isAdmin: false,
    isAuthenticated: true,
};

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
        { type: 'group', heading: 'Business', icon: 'business', items: [] },
        { type: 'link', heading: 'My identification', icon: 'document-text', href: '/complaints/my-identification' },
        { type: 'link', heading: 'Alberta Wallet', icon: 'wallet', href: '/complaints/alberta-wallet' },
        {
            type: 'group',
            heading: 'Privacy Portal',
            icon: 'lock-closed',
            items: [
                { type: 'link', heading: 'Privacy features', href: '/complaints/features' },
                { type: 'link', heading: 'Service activity', href: '/account-history/accessed-services' },
                { type: 'link', heading: 'Privacy complaint', href: '/complaints/file-complaint' },
            ],
        },
        { type: 'link', heading: 'Security settings', icon: 'settings', href: '/complaints/security-settings' },
        { type: 'link', heading: 'Account activity', icon: 'time', href: '/complaints/account-activity' },
        { type: 'link', heading: 'Inbox', iconSrc: inboxEnvelope, href: '/complaints/inbox' },
    ],
};
