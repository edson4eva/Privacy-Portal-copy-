import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import { formatDate } from 'shared/src/lib/utils/dateUtils';
import ServiceDetails from 'shared/src/lib/accessed-service-details/ServiceDetails';
import { ServiceDetailModel } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';
import styles from './PreviewService.module.scss';
import { randomDate } from '../utils/dateUtils';

const PreviewService = (): React.ReactElement => {
    const { serviceId } = useParams();
    const [serviceDetails, setServiceDetails] = useState<ServiceDetailModel>();
    const [rawDates, setRawDates] = useState<Date[]>([]);

    const getRandomDates = (): Date[] => {
        const dates: Date[] = [];
        for (let index = 0; index < 5; index++) {
            dates.push(randomDate(new Date('2020-01-01'), new Date()));
        }
        return dates.sort((a, b) => b.getTime() - a.getTime());
    };
    useEffect(() => {
        async function fetchData() {
            const response = await get<{ serviceDetails: ServiceDetailModel }>(`/v1/services/${serviceId}`, {
                redirectOnError: false,
            });
            setServiceDetails(response.serviceDetails);
            setRawDates(getRandomDates());
        }
        fetchData();
    }, [serviceId]);

    const accessedDates = useMemo(() => {
        return rawDates.map((date) => formatDate(date));
    }, [rawDates]);

    return (
        <div className={styles['container']}>
            <div className={styles['child-container']}>
                {serviceDetails && (
                    <ServiceDetails
                        accessedDates={accessedDates}
                        serviceDetails={serviceDetails}
                        isAdminPanel={true}
                        isPreview={false}
                    ></ServiceDetails>
                )}
            </div>
        </div>
    );
};

export default PreviewService;
