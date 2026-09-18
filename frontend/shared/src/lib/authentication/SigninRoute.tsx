import { GoabCircularProgress } from '@abgov/react-components';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_ROUTES } from './auth-routes';
import { getAsync } from '../api';
import { useAuth } from '../context/auth-provider';
import { DEMO_USER, DEMO_USER_MENU } from '../api/demoData';
import { isDemoMode } from '../utils/demoMode';
import { User } from '../context/auth-context-interfaces';

export const SigninRoute = ({ title }: IPageSetting): React.ReactElement => {
    const { isLoading, isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const isProcessingReference = useRef(false);

    useEffect(() => {
        if (isProcessingReference.current) return;

        const redirectToSignIn = async () => {
            const parameters = new URLSearchParams();

            const requestUrl = `${API_ROUTES.access.signin}${
                parameters.toString() !== '' ? '?' : ''
            }${parameters.toString()}`;

            try {
                await getAsync<string>(requestUrl);
            } catch (error) {
                // A failed call must not strand the holder on this page.
                console.error('Sign in request failed:', error);
            }
        };

        if (isDemoMode()) {
            // The account service cannot be reached from here, so sign the
            // stood-in account in and carry on rather than waiting on a request
            // that will never answer.
            isProcessingReference.current = true;
            login({ ...DEMO_USER, userMenu: DEMO_USER_MENU } as User);
            navigate('/');
            return;
        }

        if (isAuthenticated === true) {
            isProcessingReference.current = true;
            navigate('/');
        } else if (!isLoading) {
            isProcessingReference.current = true;
            redirectToSignIn();
        }
    }, [isAuthenticated, isLoading]);

    // Previously an empty fragment, which showed as a blank page for as long as
    // the request took - or forever, if it never answered.
    return (
        <GoabCircularProgress
            variant="fullscreen"
            size="small"
            message="Sign in in progress..."
            visible={true}
        ></GoabCircularProgress>
    );
};

export default SigninRoute;
