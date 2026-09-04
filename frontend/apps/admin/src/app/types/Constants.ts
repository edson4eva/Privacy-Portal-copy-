import { DropDownEntry } from "shared/src/lib/accessed-service-details/types/Constants";
import { DropdownOption } from "../components/editing/MultiSelectDropdown";

export const AdminAuditActions: string[] = ['Added', 'Published', 'Rolled back', 'Updated'];
const Ministries: DropDownEntry[] = [
    { id: 'advanced-education', label: 'Advanced Education' },
    { id: 'affordability-and-utilities', label: 'Affordability and Utilities' },
    { id: 'agriculture-and-irrigation', label: 'Agriculture and Irrigation' },
    { id: 'arts-culture-and-status-of-women', label: 'Arts, Culture and Status of Women' },
    { id: 'children-and-family-services', label: 'Children and Family Services' },
    { id: 'communications-and-public-engagement', label: 'Communications and Public Engagement' },
    { id: 'education', label: 'Education' },
    { id: 'energy-and-minerals', label: 'Energy and Minerals' },
    { id: 'environment-and-protected-areas', label: 'Environment and Protected Areas' },
    { id: 'executive-council', label: 'Executive Council' },
    { id: 'forestry-and-parks', label: 'Forestry and Parks' },
    { id: 'health', label: 'Health' },
    { id: 'immigration-and-multiculturalism', label: 'Immigration and Multiculturalism' },
    { id: 'indigenous-relations', label: 'Indigenous Relations' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'jobs-economy-and-trade', label: 'Jobs, Economy and Trade' },
    { id: 'justice', label: 'Justice' },
    { id: 'mental-health-and-addiction', label: 'Mental Health and Addiction' },
    { id: 'primary-and-preventative-health-services', label: 'Primary and Preventative Health Services' },
    { id: 'hospital-and-surgical-health-services', label: 'Hospital and Surgical Health Services' },
    { id: 'municipal-affairs', label: 'Municipal Affairs' },
    { id: 'public-safety-and-emergency Services', label: 'Public Safety and Emergency Services' },
    { id: 'public-service-commission', label: 'Public Service Commission' },
    { id: 'seniors-community-and-social-services', label: 'Seniors, Community and Social Services' },
    { id: 'service-alberta-and-red-tape-reduction', label: 'Service Alberta and Red Tape Reduction' },
    { id: 'technology-and-innovation', label: 'Technology and Innovation' },
    { id: 'tourism-and-sport', label: 'Tourism and Sport' },
    { id: 'transportation-and-economic-corridors', label: 'Transportation and Economic Corridors' },
    { id: 'treasury-board-and-finance', label: 'Treasury Board and Finance' },
];

export const MinistryOptions: DropdownOption[] = Ministries.map((ministry) => ({
    value: ministry.id,
    label: ministry.label,
}));
