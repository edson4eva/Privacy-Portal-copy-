import { GoabSpacer } from '@abgov/react-components';
import { useNavigate } from 'react-router-dom';
import { ServiceDetailModel } from './types/ServiceDetailModel';
import { AccessServiceDate } from './types/AccessedServiceDetailsModel';
import BackButton from './back-button/BackButton';
import PreviewBanner from './preview-banner/PreviewBanner';
import ReportUnauthorizedAccess from './report-unauthorized-access/ReportUnauthorizedAccess';
import ServiceProperty from './service-property/ServiceProperty';
import AccessHistoryTable from './access-history-table/AccessHistoryTable';
import ServiceDetailsSection from './service-details-section/ServiceDetailsSection';
import ActionButtons from './action-buttons/ActionButtons';
import styles from './ServiceDetails.module.scss';

interface ServiceDetailProperties {
    isPreview: boolean;
    accessedDates: AccessServiceDate[];
    serviceDetails: ServiceDetailModel;
    isAdminPanel: boolean;
}

const ServiceDetails: React.FC<ServiceDetailProperties> = ({
    isPreview,
    accessedDates,
    serviceDetails,
    isAdminPanel,
}): React.ReactElement => {
    const navigate = useNavigate();

    const handleBack = () => {
        const backUrl = isPreview ? '/preview/accessed-services' : '/accessed-services';
        navigate(backUrl);
    };

    const handleBackToAdmin = () => {
        navigate(`/services/${serviceDetails.id}`);
    };

    const handleAccessServiceClick = () => {
        if (serviceDetails.accessServiceUrl) {
            window.open(serviceDetails.accessServiceUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        // Without a service URL the button previously did nothing at all, which
        // reads as broken. Send the user back to the list instead.
        handleBack();
    };

    const backButtonConfiguration = isAdminPanel
        ? { buttonText: 'Back to edit service', onClick: handleBackToAdmin }
        : { buttonText: 'Back to services accessed', onClick: handleBack };

    return (
        <div className={styles['container']}>
            <PreviewBanner isAdminPanel={isAdminPanel} isPreview={isPreview} />
            <BackButton {...backButtonConfiguration} />
            <div className={styles['service-name']} data-testid="service-name">
                {serviceDetails.serviceName}
            </div>
            <GoabSpacer vSpacing="m" />
            <div
                className={styles['service-description']}
                dangerouslySetInnerHTML={{ __html: serviceDetails.description ?? '' }}
            />
            <GoabSpacer vSpacing="m" />
            <ServiceProperty icon="albums" title="Category" value={serviceDetails.categoryText} />
            <GoabSpacer vSpacing="s" />
            <ServiceProperty
                icon="business"
                title="Ministry and data owner"
                value={undefined}
                valueList={serviceDetails.dataOwnerTexts}
                testId="service-propery-ministry"
                isLight
            />
            <AccessHistoryTable accessedDates={accessedDates} />
            <ReportUnauthorizedAccess />
            <ServiceDetailsSection serviceDetails={serviceDetails} />
            <ActionButtons isAdminPanel={isAdminPanel} onBack={handleBack} onAccessService={handleAccessServiceClick} />
            {isAdminPanel && <BackButton buttonText="Back to edit service" onClick={handleBackToAdmin} />}
        </div>
    );
};

export default ServiceDetails;
