import { GoabButton, GoabCircularProgress, GoabIcon } from '@abgov/react-components';
import { GoabIconType } from '@abgov/ui-components-common';
import { useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import albertaShield from '../../../assets/alberta-shield-of-arms.svg';
import styles from './AlbertaWalletPage.module.scss';

interface WalletField {
    label: string;
    value: string;
    /** Formatted for display when set; shown verbatim otherwise. */
    isDate?: boolean;
}

interface WalletDocument {
    id: string;
    documentType: string;
    icon: GoabIconType;
    primaryLabel: string;
    primaryValue: string;
    nameOnCard: string;
    addressLines?: string[];
    fields: WalletField[];
}

interface Wallet {
    documents: WalletDocument[];
}

const APP_STORE_URL = 'https://apps.apple.com/ca/app/alberta-wallet/id6448763285';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=ca.ab.gov.wallet';

/** Formats an ISO date as "May 10, 1999", the way the wallet card prints it. */
const formatCardDate = (value: string | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

const StoreBadge = ({
    href,
    icon,
    small,
    large,
}: {
    href: string;
    icon: 'logo-apple' | 'logo-google-playstore';
    small: string;
    large: string;
}): React.ReactElement => (
    <a className={styles['store']} href={href} target="_blank" rel="noopener noreferrer">
        <GoabIcon type={icon} size="large" />
        <span className={styles['store-lines']}>
            <span className={styles['store-small']}>{small}</span>
            <span className={styles['store-large']}>{large}</span>
        </span>
    </a>
);

const DocumentCard = ({
    document,
    onPresent,
}: {
    document: WalletDocument;
    onPresent: () => void;
}): React.ReactElement => (
    <button
        type="button"
        className={styles['card']}
        onClick={onPresent}
        data-testid={`wallet-card-${document.id}`}
        aria-label={`Present ${document.documentType}`}
    >
        <div className={styles['card-header']}>
            <span className={styles['card-type']}>
                <span className={styles['card-icon']}>
                    <GoabIcon type={document.icon} size="small" />
                </span>
                {document.documentType}
            </span>
            <span className={styles['wordmark']} aria-hidden>
                Alberta
                <span className={styles['wordmark-dot']} />
            </span>
        </div>

        <PpSpacer vSpacing="m" />
        <div className={styles['card-body']}>
            <div className={styles['card-fields']}>
                <div className={styles['field-label']}>{document.primaryLabel}</div>
                <div className={styles['phn']} data-testid={`primary-${document.id}`}>
                    {document.primaryValue}
                </div>

                <PpSpacer vSpacing="s" />
                <div className={styles['field-label']}>Name</div>
                <span className={styles['field-value']} data-testid={`name-${document.id}`}>
                    {document.nameOnCard}
                </span>

                {document.addressLines && (
                    <>
                        <PpSpacer vSpacing="s" />
                        <div className={styles['field-label']}>Address</div>
                        <span className={styles['field-value']} data-testid={`address-${document.id}`}>
                            {document.addressLines.map((line) => (
                                <span className={styles['address-line']} key={line}>
                                    {line}
                                </span>
                            ))}
                        </span>
                    </>
                )}

                <PpSpacer vSpacing="s" />
                <div className={styles['card-grid']}>
                    {document.fields.map((field) => (
                        <div key={field.label}>
                            <div className={styles['field-label']}>{field.label}</div>
                            <span
                                className={styles['field-value']}
                                data-testid={`field-${document.id}-${field.label.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                            >
                                {field.isDate ? formatCardDate(field.value) : field.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <img
                className={styles['crest']}
                src={albertaShield}
                alt=""
                aria-hidden
                data-testid={`crest-${document.id}`}
            />
        </div>
    </button>
);

export function AlbertaWalletPage(): React.ReactElement {
    const windowWidth = useWindowWidth();

    const [wallet, setWallet] = useState<Wallet>();
    const [isLoading, setIsLoading] = useState(true);
    const [presentingId, setPresentingId] = useState<string>();
    const [showAddNotice, setShowAddNotice] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ wallet: Wallet }>('/v1/wallet');
                setWallet(response?.wallet);
            } catch (error) {
                // The wallet service is not always reachable. Show the page with
                // no documents rather than failing outright.
                console.error('Failed to fetch wallet documents:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const documents = wallet?.documents ?? [];
    const presenting = documents.find((document) => document.id === presentingId);

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <div className={styles['header']}>
                <h1 className={styles['page-heading']}>Alberta Wallet</h1>
                <GoabButton
                    type="primary"
                    leadingIcon="add"
                    onClick={() => setShowAddNotice(true)}
                    testId="add-to-wallet"
                >
                    Add to Alberta Wallet
                </GoabButton>
            </div>

            {showAddNotice && (
                <>
                    <PpSpacer vSpacing="m" />
                    <p className={styles['empty']} data-testid="add-notice">
                        A document is issued to your wallet through the Alberta Wallet app on your phone, where it is
                        bound to your device. It cannot be added from a browser.
                    </p>
                </>
            )}

            <PpSpacer vSpacing="l" />

            {documents.length === 0 ? (
                <p className={styles['empty']} data-testid="wallet-empty">
                    You have no documents in your Alberta Wallet. Choose Add to Alberta Wallet to add a
                    government-issued digital document.
                </p>
            ) : (
                documents.map((document) => (
                    <div key={document.id}>
                        <DocumentCard document={document} onPresent={() => setPresentingId(document.id)} />
                        <PpSpacer vSpacing="s" />
                        <div className={styles['hint']}>
                            <GoabIcon type="information-circle" size="small" />
                            Click or tap card to present digital document
                        </div>
                        <PpSpacer vSpacing="l" />
                    </div>
                ))
            )}

            {presenting && (
                <>
                    <div className={styles['present']} data-testid="present-panel">
                        <div className={styles['present-code']}>
                            <GoabIcon type="qr-code" size="4" />
                        </div>
                        <PpSpacer vSpacing="s" />
                        <p>
                            Presenting your {presenting.documentType}. A verifier scans this code to confirm the
                            document without seeing the rest of your information.
                        </p>
                        <PpSpacer vSpacing="m" />
                        <GoabButton type="secondary" onClick={() => setPresentingId(undefined)} testId="stop-presenting">
                            Done
                        </GoabButton>
                    </div>
                    <PpSpacer vSpacing="xl" />
                </>
            )}

            <div className={styles['promo']}>
                <div className={styles['promo-copy']}>
                    <h2 className={styles['promo-heading']}>Get the Alberta Wallet app</h2>
                    <p className={styles['promo-text']}>
                        Download the Alberta Wallet app to securely access your government-issued digital documents
                        anytime, anywhere.
                    </p>
                    <div className={styles['stores']}>
                        <StoreBadge
                            href={APP_STORE_URL}
                            icon="logo-apple"
                            small="Download on the"
                            large="App Store"
                        />
                        <StoreBadge
                            href={GOOGLE_PLAY_URL}
                            icon="logo-google-playstore"
                            small="Get it on"
                            large="Google Play"
                        />
                    </div>
                </div>
            </div>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default AlbertaWalletPage;
