import PageTitle from 'shared/src/lib/page-title/PageTitle';
import styles from './LandingPageTemplate.module.scss';
import { GoabIcon } from '@abgov/react-components';
interface LandingPageTemplateProperties {
    title: string;
    alertText?: string;
    listTitle: string;
    buttonSection: React.ReactNode;
}

const LandingPageTemplate: React.FC<LandingPageTemplateProperties> = ({
    title,
    alertText,
    listTitle,
    buttonSection,
}) => (
    <div>
        <PageTitle title="SERVICES ACCESSED" fontColor="#004A8F" />
        <h2 className={styles['heading']} data-testid="page-heading">
            {title}
        </h2>
        {alertText && (
            <div className={styles['alert-section']} data-testid="alert-section">
                <div>
                    <GoabIcon type="alert-circle" fillColor="#000" theme="outline" testId="alert-icon"></GoabIcon>
                </div>
                <div data-testid="alert-text">{alertText}</div>
            </div>
        )}
        <p className={styles['ability-list-heading']} data-testid="ability-list-heading">
            {listTitle}
        </p>
        <ul className={styles['ability-list']} data-testid="ability-list">
            <li>When you accessed the digital services</li>
            <li>What personal information is maintained</li>
            <li>How your information is used</li>
        </ul>
        <div className={styles['landing-page-img']} data-testid="landing-page-img">
            <img src="./assets/account-history-landing-page-img.svg" role="none"></img>
        </div>
        <div className={styles['button-container']} data-testid="button-container">
            {buttonSection}
        </div>
    </div>
);

export default LandingPageTemplate;
