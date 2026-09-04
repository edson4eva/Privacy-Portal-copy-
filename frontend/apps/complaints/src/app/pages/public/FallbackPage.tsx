import { GoabButton } from '@abgov/react-components';
import ErrorPage from 'shared/src/lib/error-page/ErrorPage';
import styles from './FallbackPage.module.scss';
import React from 'react';
import { FallbackProps } from 'react-error-boundary';

const FallbackUI = ({ resetErrorBoundary }: FallbackProps): React.ReactNode => {
    return (
        <>
            <div className={styles['container']}>
                <ErrorPage></ErrorPage>
                <div>
                    <GoabButton mt="m" mb="xl" type="primary" onClick={resetErrorBoundary}>
                        Reload
                    </GoabButton>
                </div>
            </div>
        </>
    );
};

export default FallbackUI;
