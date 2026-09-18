import { GoabCircularProgress } from '@abgov/react-components';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_ROUTES, DEMO_SIGN_IN_HREF } from './auth-routes';
import { getAsync } from '../api';
import { useAuth } from '../context/auth-provider';
import { isDemoMode } from '../utils/demoMode';
import React from 'react';

export const SignoutRoute: React.FC<IPageSetting> = ({ title }: IPageSetting) => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const isProcessingReference = useRef(false);
    useEffect(() => {
        if (isProcessingReference.current) return;

        const signout = async () => {
            isProcessingReference.current = true;

            if (isDemoMode()) {
                // There is no session to end with the account service, and it
                // cannot be reached from here in any case. Drop the stood-in
                // account and go where signing back in is possible - every page
                // behind the menu requires a signed-in holder, so landing on one
                // would only spin.
                logout();
                window.location.assign(DEMO_SIGN_IN_HREF);
                return;
            }

            if (isAuthenticated === true) {
                try {
                    await getAsync<SignoutCommand.Response>(API_ROUTES.access.signout);
                } catch (error) {
                    // A failed call must not strand the holder on this spinner.
                    // The local session is dropped either way.
                    console.error('Sign out request failed:', error);
                }
                logout();
            }

            navigate('/');
        };
        signout();
    }, [isAuthenticated]);

    return (
        <>
            <GoabCircularProgress
                variant="fullscreen"
                size="small"
                message="Sign out in progress..."
                visible={true}
            ></GoabCircularProgress>
        </>
    );
};

export default SignoutRoute;
