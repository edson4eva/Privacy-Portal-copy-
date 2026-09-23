import useWindowWidth from '../utils/useWindowWidth';
import styles from './AlbertaAccountModal.module.scss';

import { GoabDivider, GoabIcon, GoabSpacer } from '@abgov/react-components';

const AlbertaAccountModal = (): React.ReactElement => {
    const windowWidth = useWindowWidth();
    return (
        <>
            <GoabDivider />
            <GoabSpacer vSpacing="2xl" />
            <div className={styles['decide-alert']}>
                <div>
                    <GoabIcon type="alert-circle" theme="outline"></GoabIcon>
                </div>
                <div>Having trouble with your Alberta.ca Account?</div>
            </div>
            {windowWidth <= 623 && <GoabSpacer vSpacing="m" />}
            <div>
                If you're having problems with your account (like not being able to verify it), you can fill out the
                support form on this page or contact the Alberta.ca Account team for help.
            </div>
            <GoabSpacer vSpacing="m" />
            <div>
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.alberta.ca/alberta-ca-account-contact"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'underline',
                    }}
                >
                    Get help with your account
                    <GoabIcon type="open" />
                </a>
            </div>
            <GoabSpacer vSpacing="2xl" />
        </>
    );
};

export default AlbertaAccountModal;
