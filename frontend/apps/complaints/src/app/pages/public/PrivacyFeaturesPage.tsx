import { GoabIcon } from '@abgov/react-components';
import { Link } from 'react-router-dom';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './PrivacyFeaturesPage.module.scss';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';

export function PrivacyFeaturesPage(): React.ReactElement {
    const windowWidth = useWindowWidth();
    const cardStyles = [styles['card'], styles['no-border']].join(' ');

    return (
        <>
            <div className={styles['container']}>
                {windowWidth <= 623 && (
                    <>
                        <PpSpacer vSpacing="xl" />
                    </>
                )}
                <PageTitle title="PRIVACY PORTAL" fontColor="#004F84" />
                <PpSpacer vSpacing="m" />
                <div className={styles['header-xl-wrapper']}>
                    <PageSubTitle subTitle="Protecting your privacy" />
                </div>
                <PpSpacer vSpacing="m" />
                <p>
                    In Alberta, your privacy matters. We're committed to keeping your personal information safe and
                    providing you transparency over how it's used.
                </p>
                <PpSpacer vSpacing="xl" />
                <header></header>
                <div className={styles['header-img']}>
                    <img alt="" src="./assets/features/new-privacy-features-page-image.png" />
                </div>
                <PpSpacer vSpacing="2xl" />
                <label className={styles['span-label']}>What's new</label>
                <PpSpacer vSpacing="l" />
                <div className={styles['list-whats-new']}>
                    <div className={styles['item']}>
                        <img aria-hidden className={styles['icon']} src="./assets/features/shield-icon.svg" />
                        <p>
                            <b>Service access history:</b> See a list of select digital services you've used.
                        </p>
                    </div>
                    <PpSpacer vSpacing="s" />
                    <div className={styles['item']}>
                        <img aria-hidden className={styles['icon']} src="./assets/features/shield-icon.svg" />
                        <p>
                            <b>Carefully selected services:</b> Services are picked based on how often Albertans use
                            them and what's possible to include right now.
                        </p>
                    </div>
                    <PpSpacer vSpacing="s" />
                    <div className={styles['item']}>
                        <img aria-hidden className={styles['icon']} src="./assets/features/shield-icon.svg" />
                        <p>
                            <b>More services coming soon:</b> Don't see a service you've accessed? We are working to add
                            more.
                        </p>
                    </div>
                    <PpSpacer vSpacing="s" />
                    <div className={styles['item']}>
                        <img aria-hidden className={styles['icon']} src="./assets/features/shield-icon.svg" />
                        <p>
                            <b>File a privacy complaint:</b> Have concerns about how your information is being handled?
                            Let us know.
                        </p>
                    </div>
                </div>
                <PpSpacer vSpacing="2xl" />
                <label className={styles['span-label']}>Your data and privacy options</label>
                <PpSpacer vSpacing="l" />
                <div className={styles['options']}>
                    <div className={cardStyles}>
                        <img
                            title="sevices-accessed"
                            src="./assets/features/2025_New-features-page-Services-accessed.png"
                        />
                        <PpSpacer vSpacing="xl" />
                        <label className={styles['options-title']}>Services accessed</label>
                        <PpSpacer vSpacing="s" />
                        <p>Check which digital services you've used and the personal information they hold.</p>
                        <PpSpacer vSpacing="l" />
                        <Link to={`${process.env.NX_PUBLIC_APP_URL}/privacy/account-history`}>View</Link>
                    </div>
                    <div className={cardStyles}>
                        <img
                            title="privacy-complaint"
                            src="./assets/features/2025_New-features-page-Privacy-complaint.png"
                        />
                        <PpSpacer vSpacing="xl" />
                        <label className={styles['options-title']}>Privacy complaint</label>
                        <PpSpacer vSpacing="s" />
                        <p>
                            Report any concerns about how the Government of Alberta handles your personal information.
                        </p>
                        <PpSpacer vSpacing="l" />
                        <Link to={`${process.env.NX_PUBLIC_APP_URL}/privacy/complaints/file-complaint`}>
                            File a complaint
                        </Link>
                    </div>
                    <div className={cardStyles + ' ' + styles['security']}>
                        <img
                            title="security-settings"
                            src="./assets/features/2025_New-features-page-Security-settings.png"
                        />
                        <PpSpacer vSpacing="xl" />
                        <label className={styles['options-title']}>Security settings</label>
                        <PpSpacer vSpacing="s" />
                        <p>Keep your Alberta.ca Account secure by updating your sign-in and recovery details.</p>
                        <PpSpacer vSpacing="l" />
                        <Link to={`${process.env.NX_PUBLIC_APP_URL}/account/security-settings`}>Manage</Link>
                    </div>
                </div>
                <PpSpacer vSpacing="2xl" />
                <label className={styles['span-label']}>Learn more about privacy in Alberta</label>
                <PpSpacer vSpacing="l" />
                <div className={styles['learn-more']}>
                    <div className={styles['card']}>
                        <div className={styles['title']}>
                            <a
                                target="_blank"
                                rel="no-follow"
                                href="https://www.alberta.ca/lookup/personal-information-banks.aspx"
                            >
                                Personal Information Banks (PIBs) &nbsp;<GoabIcon type="open"></GoabIcon>
                            </a>
                        </div>
                        <p>Discover the types of personal information the Government of Alberta collects.</p>
                    </div>
                    <div className={styles['card']}>
                        <div className={styles['title']}>
                            <a
                                target="_blank"
                                rel="no-follow"
                                href="https://www.alberta.ca/freedom-of-information-and-protection-of-privacy"
                            >
                                Alberta public-sector privacy &nbsp;<GoabIcon type="open"></GoabIcon>
                            </a>
                        </div>
                        <p>Understand your rights and explore how Alberta public-sector privacy impacts you.</p>
                    </div>
                    <div className={styles['card']}>
                        <div className={styles['title']}>
                            <a
                                target="_blank"
                                rel="no-follow"
                                href="https://www.alberta.ca/personal-information-protection-act"
                            >
                                Alberta private-sector privacy &nbsp;<GoabIcon type="open"></GoabIcon>
                            </a>
                        </div>
                        <p>Understand your rights and explore how Alberta private-sector privacy impacts you.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PrivacyFeaturesPage;
