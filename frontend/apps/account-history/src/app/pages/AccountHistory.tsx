import { useEffect, useState } from 'react';
import BasicUserLandingPage from '../components/account-history/landing-page/BasicUserLandingPage';
import styles from './AccountHistory.module.css';
import VerifiedUserLandingPage from '../components/account-history/landing-page/VerifiedUserLandingPage';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import { LandingPageButtonLinks } from '../types/LandingPageButtonLinks';
import { User } from '@frontend/shared';

const extractBaseUrl = (fullUrl: string): string => {
    const url = new URL(fullUrl);
    const pathSegments = url.pathname.split('/');
    return `${url.protocol}//${url.host}/${pathSegments[1]}/${pathSegments[2]}`;
};

const getLandingPageButtonLinks = (currentUser: User | null): LandingPageButtonLinks => {
    const defaultLinks: LandingPageButtonLinks = {
        personalInfo: '#',
        verifyAccount: '#',
    };
    if (!currentUser) return defaultLinks;
    try {
        const profiles = currentUser?.profile.split(',');
        if (profiles.includes('personal')) {
            const PersonalInfoLink =
                currentUser.userMenu.left
                    ?.find((_) => _.heading === 'Personal')
                    ?.items?.find((_) => _.heading === 'Personal information')?.href ?? '#';
            const verifyAccountLink = `${extractBaseUrl(PersonalInfoLink)}/personal/verify/verify-account-info`;
            return {
                personalInfo: PersonalInfoLink,
                verifyAccount: verifyAccountLink,
            };
        }
    } catch (ex) {
        console.error('Error extracting landing page links:', ex);
    }
    return defaultLinks;
};

const useUser = () => {
    const { getCurrentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isUserVerified, setIsUserVerified] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsUserVerified(currentUser?.isVerified);
    }, [getCurrentUser]);

    return { user, isUserVerified };
};

const AccountHistoryLandingComponent = ({
    isVerified,
    landingPageButtonLinks,
    isPreview,
}: {
    isVerified: boolean | undefined;
    landingPageButtonLinks: LandingPageButtonLinks;
    isPreview: boolean;
}) => {
    if (isVerified === undefined) {
        return <p>Loading...</p>;
    }

    const LandingPageComponent = isVerified ? VerifiedUserLandingPage : BasicUserLandingPage;

    return (
        <div className={styles.container}>
            <LandingPageComponent
                personalInfoLink={landingPageButtonLinks.personalInfo}
                verifyAccountLink={landingPageButtonLinks.verifyAccount}
                isPreview={isPreview}
            />
        </div>
    );
};

const AccountHistory = ({ isPreview }: { isPreview: boolean }): React.ReactElement => {
    const { user, isUserVerified } = useUser();
    const landingPageButtonLinks = getLandingPageButtonLinks(user);

    return (
        <AccountHistoryLandingComponent
            isVerified={isUserVerified}
            landingPageButtonLinks={landingPageButtonLinks}
            isPreview={isPreview}
        />
    );
};

export default AccountHistory;
