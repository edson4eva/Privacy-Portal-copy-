import { GoabBadge, GoabCircularProgress } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './PersonalInformationPage.module.scss';

interface PersonalInformation {
    identity: { legalName: string; preferredName: string; dateOfBirth: string };
    contact: { email: string; emailVerified: boolean; phone: string; phoneVerified: boolean };
    address: { street: string; unit?: string; city: string; province: string; postalCode: string };
    account: { accountType: string; verificationLevel: string; lastUpdated: string };
}

const NOT_PROVIDED = 'Not provided';

const formatLongDate = (value: string | undefined): string => {
    if (!value) {
        return NOT_PROVIDED;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return NOT_PROVIDED;
    }

    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

const Row = ({ label, value, badge }: { label: string; value?: string; badge?: React.ReactNode }) => {
    const isEmpty = !value;

    return (
        <div className={styles['row']}>
            <div className={styles['label']}>{label}</div>
            <div className={`${styles['value']} ${isEmpty ? styles['value-empty'] : ''}`}>
                {badge ? (
                    <span className={styles['badges']}>
                        <span>{value || NOT_PROVIDED}</span>
                        {badge}
                    </span>
                ) : (
                    value || NOT_PROVIDED
                )}
            </div>
        </div>
    );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <>
        <PpSpacer vSpacing="2xl" />
        <label className={styles['section-title']}>{title}</label>
        <PpSpacer vSpacing="s" />
        <div className={styles['rows']}>{children}</div>
    </>
);

export function PersonalInformationPage(): React.ReactElement {
    const windowWidth = useWindowWidth();
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    const [information, setInformation] = useState<PersonalInformation>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ personalInformation: PersonalInformation }>('/v1/personal-information');
                setInformation(response?.personalInformation);
            } catch (error) {
                // The profile service is not always reachable. Fall back to what
                // the signed-in account already tells us rather than failing.
                console.error('Failed to fetch personal information:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const { identity, contact, address, account } = information ?? ({} as PersonalInformation);

    // Prefer the account's own claims for identity, since those are authoritative.
    const legalName = user?.name?.trim() || identity?.legalName;
    const email = user?.email || contact?.email;

    const addressLines = address
        ? [address.unit, address.street, `${address.city}, ${address.province}  ${address.postalCode}`]
              .filter(Boolean)
              .join(', ')
        : undefined;

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <PageTitle title="PERSONAL" />
            <PpSpacer vSpacing="m" />
            <PageSubTitle subTitle="Personal information" />
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                This is the personal information held on your Alberta.ca Account. Government services use it to confirm
                who you are and to contact you about the services you use.
            </p>

            <Section title="Name and date of birth">
                <Row label="Legal name" value={legalName} />
                <Row label="Preferred name" value={identity?.preferredName} />
                <Row label="Date of birth" value={formatLongDate(identity?.dateOfBirth)} />
            </Section>

            <Section title="Contact information">
                <Row
                    label="Email address"
                    value={email}
                    badge={
                        contact ? (
                            <GoabBadge
                                type={contact.emailVerified ? 'success' : 'information'}
                                content={contact.emailVerified ? 'Verified' : 'Unverified'}
                            />
                        ) : undefined
                    }
                />
                <Row
                    label="Phone number"
                    value={contact?.phone}
                    badge={
                        contact ? (
                            <GoabBadge
                                type={contact.phoneVerified ? 'success' : 'information'}
                                content={contact.phoneVerified ? 'Verified' : 'Unverified'}
                            />
                        ) : undefined
                    }
                />
            </Section>

            <Section title="Mailing address">
                <Row label="Address" value={addressLines} />
            </Section>

            <Section title="Account">
                <Row label="Account type" value={account?.accountType ?? user?.profile} />
                <Row
                    label="Identity verification"
                    value={account?.verificationLevel ?? (user?.isVerified ? 'Verified' : 'Basic')}
                />
                <Row label="Last updated" value={formatLongDate(account?.lastUpdated)} />
            </Section>

            <PpSpacer vSpacing="xl" />
            <p className={styles['footnote']}>
                Your name and date of birth come from the identification used to verify your account and cannot be
                changed here. To correct them, or to see which services have used your information, visit Services
                accessed in the Privacy Portal.
            </p>
            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default PersonalInformationPage;
