import { ReactNode, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth-provider';
import { SHARED_ROUTES } from './auth-routes';

interface AnonymousOnlyProperties {
    children?: ReactNode;
    redirectPath?: string;
}

export const AnonymousOnly: React.FC<AnonymousOnlyProperties> = ({ children, redirectPath = SHARED_ROUTES.public }) => {
    const { isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            const parameters = new URL(document.location.toString()).searchParams;
            if (parameters.get('r')) {
                // console.info(params.get('r')!.toString())
                navigate(parameters.get('r')?.toString() || '');
            } else {
                navigate(redirectPath);
            }
        }
    }, [isAuthenticated, navigate]);

    return <>{!isLoading && children ? children : <Outlet />}</>;
};

export default AnonymousOnly;
