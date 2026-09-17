import { GoabButton, GoabIcon, GoabInput } from '@abgov/react-components';
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
 * The fields arrive filled with a fictional account and nothing is checked or
 * sent anywhere: choosing Sign in simply continues to the page the link was
 * headed for. The page says as much, so it cannot be taken for the real thing.
 */
const DEMO_USERNAME = 'demo.user@example.com';
const DEMO_PASSWORD = 'demo-account';

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
    const [password, setPassword] = useState(DEMO_PASSWORD);

    const signIn = () => {
        // The destination is usually another app behind the same host, so this
        // is a document navigation rather than a route change.
        window.location.assign(returnTo);
    };

    return (
        <div className={styles['container']}>
            <div className={styles['card']}>
                <h1 className={styles['heading']}>Sign in to Alberta.ca Account</h1>
                <PpSpacer vSpacing="s" />
                <p className={styles['intro']}>Use your Alberta.ca Account to continue.</p>

                <PpSpacer vSpacing="l" />
                <div className={styles['demo-notice']} data-testid="demo-notice">
                    <GoabIcon type="information-circle" size="medium" />
                    <div>
                        <strong className={styles['demo-notice-title']}>Demonstration sign-in</strong>
                        <p>
                            This stands in for the Alberta.ca Account sign-in. A fictional account is already filled
                            in, so there is nothing to enter - choose Sign in to continue. Nothing is checked or sent
                            anywhere.
                        </p>
                    </div>
                </div>

                <PpSpacer vSpacing="l" />
                <div className={styles['field']}>
                    <label className={styles['field-label']} htmlFor="signin-username">
                        Email address
                    </label>
                    <GoabInput
                        id="signin-username"
                        name="signin-username"
                        type="email"
                        value={username}
                        onChange={(detail) => setUsername(detail.value)}
                        testId="signin-username"
                    />
                </div>

                <PpSpacer vSpacing="m" />
                <div className={styles['field']}>
                    <label className={styles['field-label']} htmlFor="signin-password">
                        Password
                    </label>
                    <GoabInput
                        id="signin-password"
                        name="signin-password"
                        type="password"
                        value={password}
                        onChange={(detail) => setPassword(detail.value)}
                        testId="signin-password"
                    />
                </div>

                <PpSpacer vSpacing="xl" />
                <div className={styles['actions']}>
                    <GoabButton type="primary" onClick={signIn} testId="signin-submit">
                        Sign in
                    </GoabButton>
                    <GoabButton type="tertiary" onClick={() => navigate('/features')} testId="signin-cancel">
                        Cancel
                    </GoabButton>
                </div>
            </div>
        </div>
    );
}

export default SignInPage;
