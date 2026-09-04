import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import { get } from 'shared/src/lib/api/dataService';
import { ReactNode, useEffect, useState } from 'react';

interface AdminUserRole {
    isAdmin: boolean;
}

export const AdminOnly: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const { isLoading, isAuthenticated, getCurrentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            navigate('/signin');
        }

        async function fetchData() {
            const response = await get<AdminUserRole>('/v1/is-admin');
            setIsAdmin(response && response.isAdmin === true);
        }
        fetchData();
    }, [isAuthenticated, isLoading]);
    return (
        <>
            {!isLoading && children ? (
                isAdmin ? (
                    children
                ) : (
                    <p>You are not authorized to access the admin area.</p>
                )
            ) : (
                <Outlet />
            )}
        </>
    );
};

export default AdminOnly;
