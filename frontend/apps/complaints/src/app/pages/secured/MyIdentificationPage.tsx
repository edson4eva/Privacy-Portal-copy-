import { GoabBadge, GoabCircularProgress, GoabIcon } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './MyIdentificationPage.module.scss';

interface IdentificationCard {
    nameOnCard: string;
    mailingAddressLines: string[];
    dateOfBirth: string;
    sex: string;
    documentLabel: string;
    documentNumber: string;
    expiryDate: string;
}

interface Identification {
    isVerifiedAccount: boolean;
    cardType: string;
    card: IdentificationCard;
}

const NOT_PROVIDED = 'Not provided';

const REGISTRY_AGENT_URL = 'https://www.alberta.ca/registry-agent-product-catalogue';
const REQUIRED_DOCUMENTS_URL = 'https://www.alberta.ca/identification-requirements';

/**
 * Formats an ISO date as "24 February 1973", the way the identity card prints
 * it. The parts are assembled rather than left to toLocaleDateString, because
 * the day/month order it chooses varies by locale and en-CA renders
 * "February 24, 1973".
 */
const formatCardDate = (value: string | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    const month = date.toLocaleDateString('en-CA', { month: 'long', timeZone: 'UTC' });
    return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
};

const Row = ({
    label,
    value,
    lines,
    testId,
}: {
    label: string;
    value?: string;
    lines?: string[];
    testId?: string;
}): React.ReactElement => {
    const hasLines = !!lines?.length;
    const isEmpty = !hasLines && !value;

    return (
        <>
            <div className={styles['label']}>{label}</div>
            <div className={`${styles['value']} ${isEmpty ? styles['value-empty'] : ''}`} data-testid={testId}>
                {hasLines
                    ? lines?.map((line) => (
                          <span className={styles['address-line']} key={line}>
                              {line}
                          </span>
                      ))
                    : value || NOT_PROVIDED}
            </div>
        </>
    );
};

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }): React.ReactElement => (
    <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className={styles['link-icon']} aria-hidden>
            <GoabIcon type="open" size="small" />
        </span>
    </a>
);

export function MyIdentificationPage(): React.ReactElement {
    const windowWidth = useWindowWidth();
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    const [identification, setIdentification] = useState<Identification>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ identification: Identification }>('/v1/identification');
                setIdentification(response?.identification);
            } catch (error) {
                // The identity service is not always reachable. Show the page
                // with empty values rather than failing outright.
                console.error('Failed to fetch identification:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const card = identification?.card;
    const isVerified = identification?.isVerifiedAccount ?? user?.isVerified ?? false;

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <GoabBadge
                type={isVerified ? 'success' : 'information'}
                content={isVerified ? 'Verified account' : 'Basic account'}
            />
            <PpSpacer vSpacing="m" />
            <h1 className={styles['page-heading']}>My identification</h1>
            <PpSpacer vSpacing="l" />
            <h2 className={styles['card-type']}>{identification?.cardType ?? 'Alberta identification'}</h2>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                This information is verified via your identification and cannot be edited online. Visit a{' '}
                <ExternalLink href={REGISTRY_AGENT_URL}>registry agent</ExternalLink> with{' '}
                <ExternalLink href={REQUIRED_DOCUMENTS_URL}>your documents</ExternalLink> to change it.
            </p>
            <PpSpacer vSpacing="xl" />

            <div className={styles['card']} data-testid="identification-card">
                <div className={styles['rows']}>
                    <Row label="Name on card" value={card?.nameOnCard} testId="name-on-card" />
                    <Row label="Mailing address" lines={card?.mailingAddressLines} testId="mailing-address" />
                    <Row label="Date of birth" value={formatCardDate(card?.dateOfBirth)} testId="date-of-birth" />
                    <Row label="Sex" value={card?.sex} testId="sex" />
                    <Row
                        label={card?.documentLabel ?? "Alberta driver's licence"}
                        value={card?.documentNumber}
                        testId="document-number"
                    />
                    <Row label="Expiry date" value={formatCardDate(card?.expiryDate)} testId="expiry-date" />
                </div>
            </div>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default MyIdentificationPage;
