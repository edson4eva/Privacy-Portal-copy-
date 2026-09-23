import { GoabButton, GoabFormItem } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'shared/src/lib/context/auth-provider';

import style from './ComplaintStartPage.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import { trackEvent } from 'shared/src/lib/api/tagManagerService';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';

interface StartPageProperties {
    onStart: () => void;
}

const FileComplaint = ({ onStart }: StartPageProperties): React.ReactElement => {
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [recaptchaLoaded, setReCaptchaLoaded] = useState(false);
    const [showError, setShowError] = useState(false);
    const siteKey = process.env.NX_PUBLIC_SITE_KEY as string;
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const [isGuest, setIsGuest] = useState(false);
    const windowWidth = useWindowWidth();

    useEffect(() => {
        if (user?.profile === 'guest') {
            setIsGuest(true);
        }
    }, [user]);

    useEffect(() => {
        if (isGuest) {
            setReCaptchaLoaded(true);
        }
    }, [isGuest]);

    const handleStartClick = () => {
        // these object properties are in snake_case. Do not change them to camelCase. This is how the GA event has been set up.
        trackEvent({
            action: 'pp_start_complaint_btn_click',
            category: 'pp_complaint_process',
            label: 'pp_complaint_process_start',
        });

        if (user?.isAuthenticated) {
            onStart();
        } else if (isGuest) {
            if (captchaVerified) {
                onStart();
            } else {
                setShowError(true);
            }
        } else {
            setShowError(true);
        }
    };

    const onChange = (value: string | null) => {
        setCaptchaVerified(!!value);
    };

    const navigate = useNavigate();
    const handleBackClick = () => {
        if (user?.isAuthenticated) {
            // these object properties are in snake_case. Do not change them to camelCase. This is how the GA event has been set up.
            trackEvent({
                action: 'pp_complaint_history_link_click',
                category: 'pp_complaint_history',
                label: 'pp_complaint_history_menu',
            });
            navigate('/complaint-history');
        }
    };
    return (
        <>
            {windowWidth <= 623 && (
                <>
                    <PpSpacer vSpacing="xl"></PpSpacer>
                    <PageTitle title="PRIVACY COMPLAINT" />
                    <PpSpacer vSpacing="s"></PpSpacer>
                    <PageSubTitle subTitle="File a complaint" fontWeight="normal" />
                </>
            )}
            <p className={style['bullet-list-title']}>
                Use this feature to file a privacy complaint regarding the unauthorized:
            </p>
            <ul className={style['square-bullet-list']}>
                <li>Access</li>

                <li>Collection</li>

                <li>Use</li>

                <li>Disclosure</li>

                <li>Destruction</li>
            </ul>
            <p className={style['bullet-list-description']}>
                of your personal information by a{' '}
                <a href="https://www.alberta.ca/ministries" target="_blank">
                    Government of Alberta (GoA)
                </a>{' '}
                department, agency, board, or commission (ABCs).
            </p>
            <PpSpacer vSpacing="l"></PpSpacer>
            <img
                alt=""
                src="./assets/privacy-portal_file-a-complaint-illustration-1.png"
                style={{ height: 220, width: 221 }}
            />
            <PpSpacer vSpacing="xl"></PpSpacer>
            {isGuest && recaptchaLoaded && (
                <>
                    <div style={{ borderRadius: '7px', overflow: 'hidden' }}>
                        <ReCAPTCHA sitekey={siteKey} onChange={onChange} />
                    </div>
                    <GoabFormItem
                        error={showError ? 'Confirm that you are not a robot' : ''}
                        requirement="required"
                    ></GoabFormItem>
                </>
            )}
            <PpSpacer vSpacing="xl"></PpSpacer>
            <div className={style['button-div']}>
                <GoabButton mt="m" onClick={handleStartClick} testId="file-complaint-button">
                    File a complaint
                </GoabButton>
                {!isGuest && (
                    <div className={style['only-desktop-button']}>
                        <GoabButton
                            mt="m"
                            ml="s"
                            type="secondary"
                            onClick={handleBackClick}
                            testId="view-complaint-history-button"
                        >
                            View complaint history
                        </GoabButton>
                    </div>
                )}
            </div>

            {/* TODO - verify the flow */}
            {user?.isAuthenticated && (
                <>
                    <div className={style['line-container']}>
                        <div className={style['line']}></div>
                        <span className={style['span-text']}>or</span>
                        <div className={style['line']}></div>
                    </div>

                    <div className={style['button-container']}>
                        <GoabButton type="secondary" onClick={handleBackClick} testId="view-complaint-history-button">
                            View complaint history
                        </GoabButton>
                    </div>
                </>
            )}
            <PpSpacer vSpacing="2xl"></PpSpacer>
        </>
    );
};

export default FileComplaint;
