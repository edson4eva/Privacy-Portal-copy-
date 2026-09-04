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
    accessedServices: DEMO_ACCESSED_SERVICES.map(({ id, serviceName, categoryId, lastAccessedOn, isAvailable }) => ({
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

    const detailMatch = /^accessed-services\/(.+)$/.exec(path);
    if (detailMatch) {
        return detailResponse(decodeURIComponent(detailMatch[1]));
    }

    return undefined;
};
