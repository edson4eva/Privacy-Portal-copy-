import { GoabButton, GoabCircularProgress } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './PaymentPreferencesPage.module.scss';

interface PaymentAccount {
    id: string;
    method: string;
    isInteracVerified: boolean;
    accountHolder: string;
    bankInstitution: string;
    branchTransit: string;
    accountNumberLast4: string;
    retrievedOn: string;
}

interface PaymentPreferences {
    accounts: PaymentAccount[];
}

/** Payments are provincial, so timestamps are shown in Alberta's timezone. */
const ALBERTA_TIME_ZONE = 'America/Edmonton';

/** Formats a timestamp as "Jul 2, 2026 at 08:33 AM MDT". */
const formatRetrievedOn = (value: string | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    const day = date.toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: ALBERTA_TIME_ZONE,
    });
    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: ALBERTA_TIME_ZONE,
        timeZoneName: 'short',
    });

    return `${day} at ${time}`;
};

/** Only the last four digits are held, so the rest is shown as a fixed mask. */
const maskAccountNumber = (last4: string | undefined): string | undefined =>
    last4 ? `****_****_${last4}` : undefined;

const InteracVerified = (): React.ReactElement => (
    <span className={styles['interac']} data-testid="interac-verified">
        <span className={styles['interac-badge']}>Interac</span>
        <span className={styles['interac-verified']}>
            Verified<span className={styles['interac-tm']}>&#8482;</span>
        </span>
    </span>
);

const Row = ({
    label,
    value,
    testId,
}: {
    label: string;
    value?: string;
    testId?: string;
}): React.ReactElement => (
    <>
        <div className={styles['label']}>{label}</div>
        <div className={styles['value']} data-testid={testId}>
            {value || 'Not provided'}
        </div>
    </>
);

export function PaymentPreferencesPage(): React.ReactElement {
    const windowWidth = useWindowWidth();

    const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ paymentPreferences: PaymentPreferences }>('/v1/payment-preferences');
                setAccounts(response?.paymentPreferences?.accounts ?? []);
            } catch (error) {
                // The payment service is not always reachable. Show the page with
                // no accounts rather than failing outright.
                console.error('Failed to fetch payment preferences:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const deleteAccount = (id: string) => setAccounts((previous) => previous.filter((account) => account.id !== id));

    /**
     * Adding an account really means verifying it with the holder's bank, which
     * cannot happen here. Append a further account so the layout for more than
     * one is exercised.
     */
    const addAnother = () => {
        setAccounts((previous) => {
            const template = previous[0];
            const index = previous.length + 1;

            return [
                ...previous,
                {
                    id: `direct-deposit-${index}`,
                    method: 'Direct deposit',
                    isInteracVerified: true,
                    accountHolder: template?.accountHolder ?? 'USER, Demo Alexander',
                    bankInstitution: '001 Example Trust of Canada',
                    branchTransit: '10427',
                    accountNumberLast4: String(1000 + index * 137).slice(-4),
                    retrievedOn: new Date().toISOString(),
                },
            ];
        });
    };

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <PageTitle title="PERSONAL" fontColor="#004F84" />
            <PpSpacer vSpacing="m" />
            <h1 className={styles['page-heading']}>Payment preferences</h1>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                Manage your payment details to receive payments from the Government of Alberta. You can add or delete
                bank account information at any time.
            </p>
            <PpSpacer vSpacing="xl" />

            <div className={styles['card']}>
                {accounts.length === 0 ? (
                    <>
                        <p className={styles['empty']} data-testid="payment-empty">
                            You have no bank account information on file. Add an account to receive payments from the
                            Government of Alberta by direct deposit.
                        </p>
                        <PpSpacer vSpacing="l" />
                        <GoabButton type="secondary" leadingIcon="add" onClick={addAnother} testId="add-account">
                            Add an account
                        </GoabButton>
                    </>
                ) : (
                    accounts.map((account, index) => (
                        <div className={styles['account']} key={account.id} data-testid={`account-${account.id}`}>
                            {account.isInteracVerified && (
                                <>
                                    <InteracVerified />
                                    <PpSpacer vSpacing="m" />
                                </>
                            )}

                            <div className={styles['method-row']}>
                                <h2 className={styles['method-heading']}>{account.method}</h2>
                                {index === 0 && (
                                    <GoabButton
                                        type="secondary"
                                        leadingIcon="add"
                                        onClick={addAnother}
                                        testId="add-another"
                                    >
                                        Add another
                                    </GoabButton>
                                )}
                            </div>

                            <PpSpacer vSpacing="s" />
                            <div className={styles['rows']}>
                                <Row
                                    label="Account holder"
                                    value={account.accountHolder}
                                    testId={`holder-${account.id}`}
                                />
                                <Row
                                    label="Bank institution"
                                    value={account.bankInstitution}
                                    testId={`institution-${account.id}`}
                                />
                                <Row
                                    label="Bank branch/transit"
                                    value={account.branchTransit}
                                    testId={`transit-${account.id}`}
                                />
                                <Row
                                    label="Account number"
                                    value={maskAccountNumber(account.accountNumberLast4)}
                                    testId={`number-${account.id}`}
                                />
                                <Row
                                    label="Retrieved on"
                                    value={formatRetrievedOn(account.retrievedOn)}
                                    testId={`retrieved-${account.id}`}
                                />
                            </div>

                            <PpSpacer vSpacing="l" />
                            <button
                                type="button"
                                className={styles['delete']}
                                onClick={() => deleteAccount(account.id)}
                                data-testid={`delete-${account.id}`}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default PaymentPreferencesPage;
