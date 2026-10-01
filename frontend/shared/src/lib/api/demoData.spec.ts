import { DEMO_USER_MENU, getDemoResponse } from './demoData';

/**
 * The element naming the Canada Revenue Agency assessment. Income-tested
 * programs decide eligibility by measuring income against what the citizen
 * filed for a calendar year, so wherever such a program lists financial
 * elements, the assessment has to be one of them.
 */
const CRA_ELEMENT = /Canada Revenue Agency \(CRA\)/;
const FINANCIAL = /income|financ|payment history|direct deposit/i;

interface StaffAccess {
    id: string;
    unit: string;
    categories: string[];
    information: string[];
    serviceArea?: string;
    listedService?: string;
    system?: string;
    reasonDetail?: string;
}

interface InboxMessage {
    id: string;
    programId: string;
    subject: string;
    from: string;
    receivedAt: string;
    attachment?: { name: string; meta: string };
}

interface InboxProgram {
    id: string;
    name: string;
    colour: string;
}

interface WalletCard {
    id: string;
    serviceArea?: string;
    listedService?: string;
    serviceUrl?: string;
    primaryLabel: string;
}

interface ActivityService {
    id: string;
    personalInformation?: string[];
    howPersonalInformationIsUsed?: string;
}

const staffAccess = () =>
    (getDemoResponse('/v1/staff-access') as { staffAccess: { records: StaffAccess[] } }).staffAccess.records;

describe('demo data: the CRA income assessment', () => {
    it('names the assessment on every access to a benefit programme financial element', () => {
        const financialAccesses = staffAccess().filter(
            (record) => record.categories.includes('Financial') && record.information.some((i) => FINANCIAL.test(i))
        );

        expect(financialAccesses.length).toBeGreaterThan(0);
        for (const record of financialAccesses) {
            expect(record.information.join(' | ')).toMatch(CRA_ELEMENT);
        }
    });

    it('states the calendar year the income was filed for', () => {
        for (const record of staffAccess()) {
            for (const element of record.information.filter((i) => CRA_ELEMENT.test(i))) {
                expect(element).toMatch(/\b(19|20)\d{2}\b/);
            }
        }
    });

    it('lists the assessment among what an income-tested service collects', () => {
        const services = (
            getDemoResponse('/v1/service-activity') as { serviceActivity: { services: ActivityService[] } }
        ).serviceActivity.services;
        const rebate = services.find((service) => service.id === 'alberta-energy-rebate');

        expect(rebate?.personalInformation?.join(' | ')).toMatch(CRA_ELEMENT);
        // A reader should be told what the assessment decides, not only that
        // it happened.
        expect(rebate?.howPersonalInformationIsUsed).toMatch(/Canada Revenue Agency/);
        expect(rebate?.howPersonalInformationIsUsed).toMatch(/calendar year/);
    });

    it('gives assessing the filed income as a reason the service needed it', () => {
        const details = getDemoResponse('/v1/accessed-services/alberta-energy-rebate') as {
            accessedServiceDetails: { serviceDetails: { sections: { title: string; content: string }[] } };
        };
        const privacy = details.accessedServiceDetails.serviceDetails.sections.find(
            (section) => section.title === 'Privacy Details'
        );

        expect(privacy?.content).toMatch(CRA_ELEMENT);
        expect(privacy?.content).toMatch(/calendar year/);
    });
});

interface MenuEntry {
    type: string;
    heading: string;
    subheading?: string;
    href?: string;
    items?: MenuEntry[];
}

describe('demo data: apprenticeship and industry training', () => {
    const AREA = 'Education and training';
    const SERVICE = 'Apprenticeship and industry training';
    const LINK = 'https://www.alberta.ca/apprenticeship-industry-training';

    it('logs an access to the apprenticeship record', () => {
        const record = staffAccess().find((entry) => entry.listedService === SERVICE);

        expect(record).toBeDefined();
        expect(record?.serviceArea).toBe(AREA);
        expect(record?.categories).toEqual(['Education', 'Employment']);
        expect(record?.system).toBe('MyTradesecrets');
        expect(record?.reasonDetail).toMatch(/transfer prior learning/);
    });

    it('holds a credential for it in the wallet, linked to the published page', () => {
        const documents = (getDemoResponse('/v1/wallet') as { wallet: { documents: WalletCard[] } }).wallet.documents;
        const credential = documents.find((document) => document.listedService === SERVICE);

        expect(credential).toBeDefined();
        expect(credential?.serviceArea).toBe(AREA);
        expect(credential?.serviceUrl).toBe(LINK);
        expect(credential?.primaryLabel).toBe('MyTradesecrets client ID');
    });
});

describe('demo data: the Letter of Authorization service', () => {
    const inbox = () =>
        getDemoResponse('/v1/inbox') as { inbox: { messages: InboxMessage[]; programs: InboxProgram[] } };

    it('is a message in the inbox, from Municipal Affairs', () => {
        const message = inbox().inbox.messages.find((m) => m.programId === 'letter-of-authorization');

        expect(message).toBeDefined();
        expect(message?.subject).toMatch(/Letter of Authorization \(LOA\) service/);
        expect(message?.from).toBe('Municipal Affairs');
    });

    it('carries the published document rather than an account of it', () => {
        const message = inbox().inbox.messages.find((m) => m.programId === 'letter-of-authorization');

        expect(message?.attachment?.name).toMatch(/frequently asked questions/i);
        // The PDF could not be read, so nothing in the message explains what a
        // Letter of Authorization is or how one is obtained.
        const body = JSON.stringify(message);
        expect(body).not.toMatch(/eligib|apply|applicant|authorize[sd]? (?:a|the) /i);
    });

    it('has a programme of its own, coloured from a token', () => {
        const programme = inbox().inbox.programs.find((p) => p.id === 'letter-of-authorization');

        expect(programme?.name).toBe('Letter of Authorization');
        expect(programme?.colour).toMatch(/^var\(--goa-/);
    });
});

describe('demo data: the side menu', () => {
    const left = DEMO_USER_MENU.left as MenuEntry[];
    const privacyPortal = () => left.find((entry) => entry.heading === 'Privacy Portal');

    it('keeps the citizen-facing experience inside the Privacy Portal group', () => {
        const headings = privacyPortal()?.items?.map((item) => item.heading);

        expect(headings).toEqual([
            'Privacy features',
            'Service activity',
            'Citizen-facing experience',
            'Privacy complaint',
        ]);
    });

    it('lists the Letter of Authorization service beneath the inbox', () => {
        const headings = left.map((entry) => entry.heading);
        const inbox = headings.indexOf('Inbox');
        const loa = headings.indexOf('Letter of Authorization (LOA) service');

        expect(inbox).toBeGreaterThan(-1);
        expect(loa).toBe(inbox + 1);
    });

    it('points that entry at the published reference', () => {
        const entry = left.find((item) => item.heading?.startsWith('Letter of Authorization'));

        expect(entry?.href).toBe('https://municipalaffairs.gov.ab.ca/documents/as/April2017-FAQ-LoA.pdf');
    });

    it('carries no Business group', () => {
        // It held no items, and the demo has no business profile behind it.
        expect(left.map((entry) => entry.heading)).not.toContain('Business');
    });

    it('does not also leave it at the top level', () => {
        expect(left.map((entry) => entry.heading)).not.toContain('Citizen-facing experience');
    });

    it('gives the inbox its other name on a second line', () => {
        const inbox = left.find((entry) => entry.heading === 'Inbox');

        expect(inbox?.subheading).toBe('(Unified Messaging Service)');
        // The heading stays Inbox, so the entry is still called that.
        expect(inbox?.heading).toBe('Inbox');
        expect(inbox?.href).toBe('/complaints/inbox');
    });

    it('points it at the access log', () => {
        const entry = privacyPortal()?.items?.find((item) => item.heading === 'Citizen-facing experience');

        expect(entry?.type).toBe('link');
        expect(entry?.href).toBe('/account-history/transparency');
    });
});
