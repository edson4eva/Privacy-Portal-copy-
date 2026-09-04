import { GoabButton } from '@abgov/react-components';
import ErrorPage from 'shared/src/lib/error-page/ErrorPage';
import styles from './InternalServerError.module.scss';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const InternalServerError: React.FC = (): React.ReactElement => {
    const navigate = useNavigate();
    const [searchParameters, setSearchParameters] = useSearchParams();

    const reload = () => {
        const url = searchParameters.get('returnUrl');
        if (url) {
            window.location.href = url;
        } else {
            navigate('/');
        }
    };
    return (
        <>
            <div className={styles['container']}>
                <ErrorPage></ErrorPage>
                <div>
                    <GoabButton mt="m" mb="xl" type="primary" onClick={() => reload()}>
                        Reload
                    </GoabButton>
                </div>
            </div>
        </>
    );
};

export default InternalServerError;
