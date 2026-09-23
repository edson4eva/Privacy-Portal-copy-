import { getDemoResponse } from './demoData';

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
