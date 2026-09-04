import { GoabButton } from '@abgov/react-components';
import { useNavigate } from 'react-router-dom';

import styles from './NoAccess.module.scss';

const NoAccess = (): React.ReactElement => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/business');
    };

    return (
        <div className={styles['no-access']}>
            <img src="./assets/no-access-red-cross.svg" />
            <h2 className={styles['heading']}>Something went wrong!</h2>
            {
                <>
                    <p className={styles['details']}>This feature is only available to personal users</p>
                    <GoabButton variant="normal" onClick={handleBack}>
                        Back to My Account
                    </GoabButton>
                </>
            }
        </div>
    );
};

export default NoAccess;
