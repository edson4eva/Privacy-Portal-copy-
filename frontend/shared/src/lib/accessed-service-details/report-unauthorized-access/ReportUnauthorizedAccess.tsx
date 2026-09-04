import { GoabDetails } from '@abgov/react-components';
import styles from './ReportUnauthorizedAccess.module.scss';
const ReportUnauthorizedAccess = () => {
    return (
        <div className={styles['reporting-direction-container']}>
            <GoabDetails heading="Notice unusual activity?" open={true}>
                <div className={styles['reporting-direction']}>
                    Notice any concerns or suspicious activity related to your personal information? You can now report
                    it by filing a privacy complaint.
                    <a
                        href={process.env.NX_PUBLIC_COMPLAINTS_BASE_HREF + 'file-complaint'}
                        target="_self"
                        className={styles['reporting-link']}
                    >
                        File a privacy complaint
                    </a>
                </div>
            </GoabDetails>
        </div>
    );
};

export default ReportUnauthorizedAccess;
