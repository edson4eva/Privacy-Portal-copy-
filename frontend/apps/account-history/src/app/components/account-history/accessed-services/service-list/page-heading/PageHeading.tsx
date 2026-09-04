import { GoabIcon } from '@abgov/react-components';
import styles from './PageHeading.module.scss';
const PageHeading = () => (
    <>
        <h2 className={styles['heading']} data-testid="page-heading">
            Digital services accessed online
        </h2>
        <p data-testid="sub-heading" className={styles['sub-heading']}>
            View details about the digital services you have accessed through your Alberta.ca Account.
        </p>
        <div
            className={styles['service-accessed-availability-alert']}
            data-testid="service-accessed-availability-alert"
        >
            <div>
                <GoabIcon
                    type="alert-circle"
                    fillColor="#000"
                    theme="outline"
                    testId="service-accessed-availability-alert-icon"
                ></GoabIcon>
            </div>
            <div data-testid="service-accessed-availability-text">
                Access records for some digital services are only available starting October 24, 2024, after the
                Alberta.ca Account update.
            </div>
        </div>
    </>
);
export default PageHeading;
