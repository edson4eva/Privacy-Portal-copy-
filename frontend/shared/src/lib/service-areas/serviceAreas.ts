/**
 * The categories anything in the portal can belong to: the topics Alberta.ca
 * groups its services under. Used by the access log and by the wallet, so
 * both file things under the same names.
 *
 * Taken verbatim from "Alberta.ca: All Services Inventory", the summary tab of
 * the services inventory (source: https://www.alberta.ca/all-services and each
 * linked topic page, retrieved 23 September 2026), which lists 196 services
 * across these 23 topics. The order is the inventory's own, so the categories
 * offered here can be checked against it line by line.
 *
 * Nothing is added to this list: a category the inventory does not name is not
 * a category an access can be filed under.
 */
export const SERVICE_AREAS = [
    'About government',
    'Agriculture',
    'Birth, adoption, death, marriage and divorce',
    'Business and economic development',
    'Culture',
    'Driving safety',
    'Education and training',
    'Emergency preparedness, disaster response and public safety',
    'Employment',
    'Energy',
    'Environment',
    'Family and social supports',
    'Fish and wildlife',
    'Health',
    'Housing',
    'Indigenous relations',
    'Infrastructure',
    'Justice',
    'Moving to Alberta',
    'Municipalities',
    'Non-profit and charitable organizations',
    'Tax information',
    'Tourism, sport and outdoor recreation',
] as const;

export type ServiceArea = (typeof SERVICE_AREAS)[number];

/**
 * The categories in play, being those something actually belongs to, in the
 * inventory's order. Offering all 23 would give a reader 18 categories that
 * can only ever be empty.
 */
export const serviceAreasPresent = (areas: (string | undefined)[]): string[] => {
    const present = new Set(areas.filter((area): area is string => Boolean(area)));
    return SERVICE_AREAS.filter((area) => present.has(area));
};
