import { GoabButton, GoabCheckbox, GoabCircularProgress, GoabIcon } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './SecuritySettingsPage.module.scss';

interface SecuritySettings {
    twoStepVerificationEnabled: boolean;
    signInEmail: string;
    recoveryEmail?: string;
    expiryReminderEnabled: boolean;
}

/**
 * A password is never returned by an API, so the row shows a fixed mask rather
 * than anything derived from a real value.
 */
const PASSWORD_MASK = '*'.repeat(20);

/**
 * Changing sign-in credentials happens in the Alberta.ca Account itself, which
 * is not part of this repository. These controls say so rather than presenting
 * a form that would look like it changes a password but cannot.
 */
const CHANGE_ELSEWHERE = 'This is changed in your Alberta.ca Account, which is not available from here.';

export function SecuritySettingsPage(): React.ReactElement {
    const windowWidth = useWindowWidth();
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    const [settings, setSettings] = useState<SecuritySettings>();
    const [isLoading, setIsLoading] = useState(true);
    const [twoStepEnabled, setTwoStepEnabled] = useState(false);
    const [remindOnExpiry, setRemindOnExpiry] = useState(false);
    const [noticeFor, setNoticeFor] = useState<string>();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ securitySettings: SecuritySettings }>('/v1/security-settings');
                const loaded = response?.securitySettings;
                setSettings(loaded);
                setTwoStepEnabled(loaded?.twoStepVerificationEnabled ?? false);
                setRemindOnExpiry(loaded?.expiryReminderEnabled ?? false);
            } catch (error) {
                // The account service is not always reachable. Show the page with
                // what the signed-in account tells us rather than failing.
                console.error('Failed to fetch security settings:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const signInEmail = settings?.signInEmail || user?.email;
    const recoveryEmail = settings?.recoveryEmail;

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <h1 className={styles['page-heading']}>Security settings</h1>
            <PpSpacer vSpacing="l" />

            <div className={styles['card']}>
                <div className={styles['card-header']}>
                    <h2 className={styles['card-heading']}>
                        2-Step Verification
                        <span className={styles['state']} data-testid="two-step-state">
                            {twoStepEnabled ? 'On' : 'Off'}
                        </span>
                    </h2>
                    <button
                        type="button"
                        className={styles['action']}
                        onClick={() => setTwoStepEnabled((previous) => !previous)}
                        data-testid="toggle-two-step"
                    >
                        <GoabIcon type="power" size="small" />
                        {twoStepEnabled ? 'Turn off' : 'Turn on'}
                    </button>
                </div>
                <PpSpacer vSpacing="m" />
                <p>
                    Enhance your Alberta.ca Account security. In addition to your email and password, you'll enter a
                    security code when signing in.
                </p>
            </div>

            <PpSpacer vSpacing="l" />

            <div className={styles['card']}>
                <h2 className={styles['card-heading']}>Sign-in and recovery information</h2>
                <PpSpacer vSpacing="l" />
                <div className={styles['rows']}>
                    <div className={styles['label']}>Sign-in email</div>
                    <div className={styles['value']} data-testid="sign-in-email">
                        {signInEmail || 'Not provided'}
                    </div>
                    <button
                        type="button"
                        className={styles['action']}
                        onClick={() => setNoticeFor('sign-in-email')}
                        data-testid="edit-sign-in-email"
                    >
                        Edit
                    </button>
                    {noticeFor === 'sign-in-email' && (
                        <p className={styles['notice']} data-testid="notice-sign-in-email">
                            {CHANGE_ELSEWHERE}
                        </p>
                    )}

                    <div className={styles['label']}>Password</div>
                    <div className={styles['value']} data-testid="password">
                        {PASSWORD_MASK}
                    </div>
                    <button
                        type="button"
                        className={styles['action']}
                        onClick={() => setNoticeFor('password')}
                        data-testid="edit-password"
                    >
                        Edit
                    </button>
                    {noticeFor === 'password' && (
                        <p className={styles['notice']} data-testid="notice-password">
                            {CHANGE_ELSEWHERE}
                        </p>
                    )}

                    <div className={styles['label']}>Recovery email</div>
                    <div
                        className={recoveryEmail ? styles['value'] : styles['value-empty']}
                        data-testid="recovery-email"
                    >
                        {recoveryEmail || 'Not provided'}
                    </div>
                    <button
                        type="button"
                        className={styles['action']}
                        onClick={() => setNoticeFor('recovery-email')}
                        data-testid="edit-recovery-email"
                    >
                        {recoveryEmail ? 'Edit' : 'Add'}
                    </button>
                    {noticeFor === 'recovery-email' && (
                        <p className={styles['notice']} data-testid="notice-recovery-email">
                            {CHANGE_ELSEWHERE}
                        </p>
                    )}
                </div>
            </div>

            <PpSpacer vSpacing="l" />

            <GoabCheckbox
                name="expiry-reminder"
                checked={remindOnExpiry}
                onChange={(detail) => setRemindOnExpiry(detail.checked)}
                testId="expiry-reminder"
                text="Stay informed about your driver's licence or identification card expiration date with an email reminder."
            />

            <PpSpacer vSpacing="2xl" />

            <h2 className={styles['delete-heading']}>Delete my account</h2>
            <PpSpacer vSpacing="m" />
            <p>
                If you choose to delete your Alberta.ca Account, you will no longer have access to it. This action
                cannot be undone.
            </p>
            <PpSpacer vSpacing="l" />

            {isConfirmingDelete ? (
                <div className={styles['confirm']} data-testid="delete-confirm">
                    <p>
                        Deleting an account is permanent and is carried out by the Alberta.ca Account service, which is
                        not available from here, so nothing has been deleted.
                    </p>
                    <PpSpacer vSpacing="m" />
                    <GoabButton type="secondary" onClick={() => setIsConfirmingDelete(false)} testId="cancel-delete">
                        Back to security settings
                    </GoabButton>
                </div>
            ) : (
                <GoabButton
                    type="primary"
                    variant="destructive"
                    onClick={() => setIsConfirmingDelete(true)}
                    testId="delete-account"
                >
                    Delete
                </GoabButton>
            )}

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default SecuritySettingsPage;
