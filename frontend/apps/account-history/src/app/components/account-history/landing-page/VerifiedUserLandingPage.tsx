import { GoabButton } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from 'shared/src/lib/api/tagManagerService';
import LandingPageTemplate from './LandingPageTemplate';

interface VerifiedUserLandingPageProperties {
    isPreview: boolean;
    personalInfoLink: string;
}
const VerifiedUserLandingPage: React.FC<VerifiedUserLandingPageProperties> = ({
    isPreview,
    personalInfoLink,
}): React.ReactElement => {
    const navigate = useNavigate();
    const [hasServicesAccessed, setHasServicesAccessed] = useState<boolean | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const endpoint = isPreview ? '/v1/preview/accessed-services' : '/v1/accessed-services';
                const response = await get<{ accessedServices: [] }>(endpoint);
                setHasServicesAccessed(response?.accessedServices?.length > 0 || false);
            } catch (error) {
                // Handle API errors gracefully - keep loading state
                console.error('Failed to fetch accessed services:', error);
                // Note: hasServicesAccessed remains null, so component stays in loading state
            }
        }
        fetchData();
    }, [isPreview]);

    const handleViewServicesClick = () => {
        trackEvent({
            action: 'pp_view_services_btn_click',
            category: 'pp_account_history',
            label: 'pp_view_services_account_history',
        });
        const url = isPreview ? '/preview/accessed-services' : '/accessed-services';
        navigate(url);
    };

    if (hasServicesAccessed === null) {
        return <p>Loading...</p>;
    }
    const servicesAccessedSection = (
        <LandingPageTemplate
            title="Digital services accessed online"
            listTitle="View details about the digital services you have accessed through your Alberta.ca Account including:"
            buttonSection={
                <GoabButton
                    testId="btn-view-services"
                    type="primary"
                    variant="normal"
                    onClick={handleViewServicesClick}
                >
                    View services
                </GoabButton>
            }
        />
    );
    const noServicesAccessedSection = (
        <LandingPageTemplate
            title="Digital services accessed online"
            alertText="We are working to include all digital service records connected to your Alberta.ca Account. You either have not accessed any digital services through your Alberta.ca Account or have accessed a digital service that has not been included yet."
            listTitle="After accessing digital services through your Alberta.ca Account, you will be able to view:"
            buttonSection={
                <GoabButton
                    testId="btn-back-to-personal-info"
                    type="secondary"
                    variant="normal"
                    leadingIcon="arrow-back"
                    onClick={() => (window.location.href = personalInfoLink)}
                >
                    Back to personal information
                </GoabButton>
            }
        />
    );
    return <>{hasServicesAccessed ? servicesAccessedSection : noServicesAccessedSection}</>;
};

export default VerifiedUserLandingPage;
