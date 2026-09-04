import { GoabButton } from '@abgov/react-components';
import LandingPageTemplate from './LandingPageTemplate';

interface BasicUserLandingPageProperties {
    personalInfoLink: string;
    verifyAccountLink: string;
}

const BasicUserLandingPage: React.FC<BasicUserLandingPageProperties> = ({
    personalInfoLink,
    verifyAccountLink,
}): React.ReactElement => {
    return (
        <LandingPageTemplate
            title="Verify your account to view services accessed"
            alertText="Protecting your personal information is our top priority, and we cannot share any details without verifying your identity."
            listTitle="After verifying your Alberta.ca Account, you will be able to view:"
            buttonSection={
                <>
                    <GoabButton
                        testId="btn-back-to-personal-info"
                        type="secondary"
                        variant="normal"
                        leadingIcon="arrow-back"
                        onClick={() => (window.location.href = personalInfoLink)}
                    >
                        Back to personal information
                    </GoabButton>
                    <GoabButton
                        testId="btn-verify-my-account"
                        type="primary"
                        variant="normal"
                        onClick={() => (window.location.href = verifyAccountLink)}
                    >
                        Verify my account
                    </GoabButton>
                </>
            }
        />
    );
};

export default BasicUserLandingPage;
