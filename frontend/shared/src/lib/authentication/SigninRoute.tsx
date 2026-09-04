import { useEffect } from 'react';
import { redirect } from 'react-router-dom';

import { API_ROUTES } from './auth-routes';
import { getAsync } from '../api';
import { useAuth } from '../context/auth-provider';

export const SigninRoute = ({ title }: IPageSetting): React.ReactElement => {
    const { isLoading, isAuthenticated } = useAuth();

    const redirectToSignIn = async () => {
        const parameters = new URLSearchParams();

        const requestUrl = `${API_ROUTES.access.signin}${
            parameters.toString() !== '' ? '?' : ''
        }${parameters.toString()}`;
        await getAsync<string>(requestUrl);
    };
    useEffect(() => {
        if (isAuthenticated === true) {
            redirect('/');
        } else if (!isLoading) {
            redirectToSignIn();
        }
    }, [isAuthenticated, isLoading]);

    return <></>;
};

export default SigninRoute;
