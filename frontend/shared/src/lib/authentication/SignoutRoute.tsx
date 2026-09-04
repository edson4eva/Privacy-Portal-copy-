import { GoabCircularProgress } from '@abgov/react-components';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_ROUTES, BASE_URL } from './auth-routes';
import { getAsync } from '../api';
import { useAuth } from '../context/auth-provider';
import React from 'react';

export const SignoutRoute: React.FC<IPageSetting> = ({ title }: IPageSetting) => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const isProcessingReference = useRef(false);
    useEffect(() => {
        if (isProcessingReference.current) return;

        const signout = async () => {
            isProcessingReference.current = true;

            if (isAuthenticated === true) {
                await getAsync<SignoutCommand.Response>(API_ROUTES.access.signout);
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
