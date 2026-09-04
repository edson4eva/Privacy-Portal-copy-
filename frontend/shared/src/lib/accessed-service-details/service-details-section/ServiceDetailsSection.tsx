import { GoabIcon, GoabSpacer } from '@abgov/react-components';
import Accordion from '../accordion/Accordion';
import { ServiceDetailModel } from '../types/ServiceDetailModel';
import styles from './ServiceDetailsSection.module.scss';

const ComingSoonBox: React.FC = () => (
    <div className={styles['service-details-coming-soon-box']}>
        <div className={styles['coming-soon-title']}>
            <div className={styles['coming-soon-title-icon']}>
                <GoabIcon
                    type="alert-circle"
                    fillColor="#000"
                    theme="outline"
                    testId="service-details-coming-soon-alert-icon"
                />
            </div>
            <div className={styles['coming-soon-title-text']}>Service details coming soon</div>
        </div>
        <GoabSpacer vSpacing="m" />
        <div className={styles['coming-soon-description']}>
            We are working to provide more details about this service, including the personal information maintained and
            how it is used. Stay tuned for updates.
        </div>
    </div>
);

const ServiceDetailsSection: React.FC<{ serviceDetails: ServiceDetailModel }> = ({ serviceDetails }) => (
    <>
        <div className={styles['service-details-title']} data-testid="service-details-title">
            Service details
        </div>
        <GoabSpacer vSpacing="s" />
        {serviceDetails.isAvailable === true && <Accordion items={serviceDetails?.sections ?? []} />}
        {serviceDetails.isAvailable === false && <ComingSoonBox />}
    </>
);

export default ServiceDetailsSection;
