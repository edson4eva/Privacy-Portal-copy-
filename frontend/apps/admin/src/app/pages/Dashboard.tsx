import { GoabButton, GoabSpacer } from '@abgov/react-components';
import styles from './Dashboard.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { useNavigate } from 'react-router-dom';

const Dashboard = (): React.ReactElement => {
    const navigate = useNavigate();
    const gotoContent = () => {
        navigate('/services');
    };
    return (
        <div className={styles['container']}>
            <div>
                <PageTitle title="PRIVACY PORTAL" fontColor="#004A8F" />
                <h2 className={styles['heading']} data-testid="page-heading">
                    Admin Content Management Portal
                </h2>
                <GoabSpacer vSpacing={'s'}></GoabSpacer>
                <div className={styles['landing-page-img']} data-testid="landing-page-img">
                    <img src="./assets/landing-page-img.svg" role="none"></img>
                </div>
                <div>
                    This is your admin portal where you can:
                    <ul className={styles['dashboard-list']}>
                        <li>Add services to the Privacy Portal</li>
                        <li>Edit service details</li>
                        <li>Publish changes to the live site</li>
                    </ul>
                    To get started, select from the menu on the above
                </div>
            </div>
            <GoabSpacer vSpacing={'xl'}></GoabSpacer>
            <div>
                <GoabButton type="primary" onClick={gotoContent}>
                    Go to content
                </GoabButton>
            </div>
            <GoabSpacer vSpacing={'2xl'}></GoabSpacer>
        </div>
    );
};

export default Dashboard;
