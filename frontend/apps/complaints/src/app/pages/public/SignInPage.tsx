import { GoabButton, GoabCheckbox, GoabIcon, GoabInput } from '@abgov/react-components';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';

import styles from './SignInPage.module.scss';

/**
 * Stands in for the Alberta.ca Account sign-in while walking through the
 * portal. The real sign-in belongs to the account service, which is not part of
 * this repository, so following a link that leaves for it drops out of the
 * demonstration entirely.
 *
 * Laid out as the account card is: the account is asked for first and Continue
 * moves on, with the other ways of signing in beneath. Nothing is checked or
 * sent anywhere - every way through simply continues to the page the link was
 * headed for - and the page says so, so it cannot be taken for the real thing.
 */
const DEMO_USERNAME = 'demo.user@example.com';

/** These belong to the account service, which this page cannot stand in for. */
const ELSEWHERE = 'This is handled by the Alberta.ca Account service, which is not available from here.';

/** Only same-origin paths are followed, so the parameter cannot send a viewer off-site. */
const safeReturnTo = (value: string | null): string => {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return '/';
    }

    return value;
};

export function SignInPage(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = safeReturnTo(searchParams.get('returnTo'));

    const [username, setUsername] = useState(DEMO_USERNAME);
    const [remember, setRemember] = useState(false);
    const [showElsewhere, setShowElsewhere] = useState(false);

    const signIn = () => {
        // The destination is usually another app behind the same host, so this
        // is a document navigation rather than a route change.
        window.location.assign(returnTo);
    };

    return (
        <div className={styles['container']}>
            <div className={styles['card']}>
                <h1 className={styles['heading']}>Sign in to Alberta.ca Account</h1>

                <PpSpacer vSpacing="l" />
                <div className={styles['demo-notice']} data-testid="demo-notice">
                    <GoabIcon type="information-circle" size="medium" />
                    <div>
                        <strong className={styles['demo-notice-title']}>Demonstration sign-in</strong>
                        <p>
                            This stands in for the Alberta.ca Account sign-in. A fictional account is already filled
                            in, so there is nothing to enter - choose Continue. Nothing is checked or sent anywhere.
                        </p>
                    </div>
                </div>

                <PpSpacer vSpacing="l" />
                <div className={styles['field']}>
                    <label className={styles['field-label']} htmlFor="signin-username">
                        Email or username
                    </label>
                    <GoabInput
                        id="signin-username"
                        name="signin-username"
                        type="text"
                        value={username}
                        onChange={(detail) => setUsername(detail.value)}
                        width="100%"
                        testId="signin-username"
                    />
                </div>

                <PpSpacer vSpacing="s" />
                <button
                    type="button"
                    className={styles['link-button']}
                    onClick={() => setShowElsewhere(true)}
                    data-testid="find-account"
                >
                    Find my account
                </button>

                <PpSpacer vSpacing="m" />
                <div className={styles['submit']}>
                    <GoabButton type="primary" width="100%" onClick={signIn} testId="signin-submit">
                        Continue
                    </GoabButton>
                </div>

                <PpSpacer vSpacing="m" />
                <div className={styles['remember']}>
                    <GoabCheckbox
                        name="remember-sign-in"
                        checked={remember}
                        onChange={(detail) => setRemember(detail.checked)}
                        text="Remember this sign in option"
                        testId="remember-sign-in"
                    />
                    <span className={styles['info-icon']} aria-hidden>
                        <GoabIcon type="information-circle" size="small" />
                    </span>
                </div>

                <PpSpacer vSpacing="l" />
                <div className={styles['divider-or']}>or</div>
                <PpSpacer vSpacing="l" />

                <div className={styles['providers']}>
                    <button
                        type="button"
                        className={styles['provider']}
                        onClick={signIn}
                        data-testid="signin-google"
                    >
                        <GoabIcon type="logo-google" size="medium" />
                        Sign in with Google
                    </button>
                    <button
                        type="button"
                        className={styles['provider']}
                        onClick={signIn}
                        data-testid="signin-microsoft"
                    >
                        <GoabIcon type="logo-microsoft" size="medium" />
                        Sign in with Microsoft
                    </button>
                </div>

                <PpSpacer vSpacing="l" />
                <hr className={styles['rule']} />
                <PpSpacer vSpacing="l" />

                <button
                    type="button"
                    className={styles['link-button']}
                    onClick={() => setShowElsewhere(true)}
                    data-testid="trouble-signing-in"
                >
                    Having trouble signing in?
                </button>

                <PpSpacer vSpacing="l" />
                <hr className={styles['rule']} />
                <PpSpacer vSpacing="l" />

                <div className={styles['create-row']}>
                    <span className={styles['create-prompt']}>
                        <span className={styles['info-icon']} aria-hidden>
                            <GoabIcon type="information-circle" size="small" />
                        </span>
                        Don't have an account?
                    </span>
                    <button
                        type="button"
                        className={styles['link-button']}
                        onClick={() => setShowElsewhere(true)}
                        data-testid="create-account"
                    >
                        Create account
                        <GoabIcon type="chevron-down" size="small" />
                    </button>
                </div>

                {showElsewhere && (
                    <>
                        <PpSpacer vSpacing="m" />
                        <p className={styles['elsewhere']} data-testid="elsewhere-notice">
                            {ELSEWHERE}
                        </p>
                    </>
                )}

                <PpSpacer vSpacing="l" />
                <GoabButton type="tertiary" onClick={() => navigate('/features')} testId="signin-cancel">
                    Cancel
                </GoabButton>
            </div>
        </div>
    );
}

export default SignInPage;
