import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth-provider';
import { ReactNode, useEffect } from 'react';
import { getAsync } from '../api';
import { API_ROUTES } from './auth-routes';
import { GoabCircularProgress } from '@abgov/react-components';

export const SignedInOnly: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const { isLoading, isAuthenticated, redirectUrl } = useAuth();

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            const parameters = new URLSearchParams();
            parameters.append('Pas.ReturnUrl', location.pathname);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            getAsync(`${API_ROUTES.access.signin}${parameters.toString() !== '' ? '?' : ''}${parameters.toString()}`);
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    if (!isAuthenticated) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    return <>{children ?? <Outlet />}</>;
};

export default SignedInOnly;
