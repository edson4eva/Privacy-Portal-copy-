import { GoabAppFooter, GoabAppFooterMetaSection } from '@abgov/react-components';

const AppFooter = (): React.ReactElement => {
    return (
        <>
            <section slot="footer">
                <GoabAppFooter maxContentWidth="100%">
                    <GoabAppFooterMetaSection>
                        <a target="_blank" href="https://www.alberta.ca/alberta-ca-account-available-services">
                            Available services
                        </a>
                        <a target="_blank" href="https://www.alberta.ca/about-alberta-ca-account#jumplinks-3">
                            Security and privacy
                        </a>
                        <a target="_blank" href="https://www.alberta.ca/about-alberta-ca-account">
                            About us
                        </a>
                        <a target="_blank" href="https://www.alberta.ca/alberta-ca-account">
                            Get help
                        </a>
                        <a target="_blank" href="https://www.alberta.ca/alberta-ca-account-contact">
                            Contact
                        </a>
                    </GoabAppFooterMetaSection>
                </GoabAppFooter>
            </section>
        </>
    );
};

export { AppFooter };
