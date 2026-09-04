import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import { AccessedServiceDetailsModel } from 'shared/src/lib/accessed-service-details/types/AccessedServiceDetailsModel';
import { formatDate } from 'shared/src/lib/utils/dateUtils';
import ServiceDetails from 'shared/src/lib/accessed-service-details/ServiceDetails';
import { ServiceDetailModel } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';

const AccessedServiceDetails = ({ isPreview }: { isPreview: boolean }): React.ReactElement => {
    const { service } = useParams();
    const [serviceDetails, setServiceDetails] = useState<ServiceDetailModel>();
    const [rawDates, setRawDates] = useState<Date[]>([]);

    useEffect(() => {
        async function fetchData() {
            const endpoint = isPreview
                ? `/v1/preview/accessed-services/${service}`
                : `/v1/accessed-services/${service}`;
            const response = await get<{ accessedServiceDetails: AccessedServiceDetailsModel }>(endpoint);
            if (response.accessedServiceDetails) {
                setServiceDetails(response.accessedServiceDetails.serviceDetails);
                if (response.accessedServiceDetails.accessedDates) {
                    setRawDates(response.accessedServiceDetails.accessedDates);
                }
            }
        }
        fetchData();
    }, [isPreview, service]);

    const accessedDates = useMemo(() => {
        return rawDates.map((date) => formatDate(date));
    }, [rawDates]);

    return (
        <>
            {serviceDetails && (
                <ServiceDetails
                    isPreview={isPreview}
                    accessedDates={accessedDates}
                    serviceDetails={serviceDetails}
                    isAdminPanel={false}
                ></ServiceDetails>
            )}
        </>
    );
};

export default AccessedServiceDetails;
