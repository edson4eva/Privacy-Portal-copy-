import { GoabButton, GoabIcon } from '@abgov/react-components';
import { useNavigate } from 'react-router-dom';
import { SHARED_ROUTES } from 'shared/src/lib/authentication/auth-routes';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';

import styles from './ComplaintLandingPage.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { trackEvent } from 'shared/src/lib/api/tagManagerService';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';

export function ComplaintLandingPage(): React.ReactElement {
    const navigate = useNavigate();
    const { login } = useAuth();
    const windowWidth = useWindowWidth();

    const handleGuestNavigate = () => {
        // these object properties are in snake_case. Do not change them to camelCase. This is how the GA event has been set up.
        trackEvent({
            action: 'pp_continue_as_guest_btn_click',
            category: 'pp_guest_user',
            label: 'pp_continue_as_guest',
        });
        login({
            name: 'Guest',
            firstName: '',
            lastName: '',
            email: '',
            profile: 'guest',
            businessName: undefined,
            userMenu: { top: null, left: null },
            isVerified: false,
            isAdmin: false,
            isAuthenticated: false,
        });
        navigate('/file-complaint');
    };

    const handleAccountLogin = () => {
        navigate(SHARED_ROUTES.signin);
    };

    return (
        <>
            <div className={styles['container']}>
                {windowWidth > 623 && <PpSpacer vSpacing="2xl" />}
                <PageTitle title="PRIVACY COMPLAINT" fontColor="#004F84" />
                <PpSpacer vSpacing="s" />
                <PageSubTitle subTitle="File a complaint" fontWeight="bold" />
                <PpSpacer vSpacing="xl" />
                <div className={styles['inner-box']}>
                    <div className={styles['container-header']}>Sign in or continue as a guest</div>
                    <div className={styles['container-title']}>
                        You can proceed to file a complaint by signing in to your Alberta.ca Account or continue as a
                        guest.
                    </div>
                    <PpSpacer vSpacing="l" />
                    <div className={styles['button-1']}>
                        <GoabButton width="412px" onClick={handleAccountLogin} type="primary" testId="sign-in-button">
                            Sign in to my Alberta.ca Account
                        </GoabButton>
                    </div>
                    <div className={styles['tertiry-button']}>
                        <div
                            style={{
                                font: 'var(--goa-typography-heading-xs)',
                                paddingTop: '5px',
                            }}
                        >
                            New to Alberta.ca Account?
                        </div>
                        <div className={styles['create-account-container']}>
                            <GoabButton type="tertiary" testId="create-account-button">
                                <div className={styles['content']}>
                                    <span className={styles['text']}>Create account</span>
                                    <span className={styles['icon']}>
                                        <GoabIcon size="small" type="chevron-down" fillColor="#004A8F"></GoabIcon>
                                    </span>
                                </div>
                            </GoabButton>
                        </div>
                    </div>
                    <div className={styles['line-container']}>
                        <div className={styles['line']}></div>
                        <span className={styles['span-text']}>or</span>
                        <div className={styles['line']}></div>
                    </div>
                    <div className={styles['button-2']}>
                        <GoabButton
                            width="412px"
                            type="secondary"
                            onClick={handleGuestNavigate}
                            testId="continue-as-guest-button"
                        >
                            Continue as a guest
                        </GoabButton>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ComplaintLandingPage;
