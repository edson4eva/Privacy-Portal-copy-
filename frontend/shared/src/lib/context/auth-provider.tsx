import { GoabCircularProgress } from '@abgov/react-components';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { API_ROUTES } from '../authentication/auth-routes';
import { getAsync, isSuccessResponse } from '../api/authService';
import { User } from './auth-context-interfaces';
import { Navigate } from 'react-router-dom';
import { isDemoMode } from '../utils/demoMode';

interface AuthContextType {
    isLoading: boolean;
    hasLoaded: boolean;
    isAuthenticated: boolean | undefined;
    redirectUrl?: string;
    login: (user: User) => void;
    logout: () => void;
    getCurrentUser: () => User | null;
}

const AuthContext = createContext<AuthContextType>({
    isLoading: false,
    hasLoaded: false,
    isAuthenticated: undefined,
    redirectUrl: undefined,
    login: () => {},
    logout: () => {},
    getCurrentUser: () => null,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const [, setLocation] = useState<string | undefined>(undefined);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const signInDemoUser = () => {
            setIsAuthenticated(true);
            setUser({
                name: 'Demo User',
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo.user@example.com',
                profile: 'personal',
                businessName: undefined,
                userMenu: { top: null, left: null },
                isVerified: true,
                isAdmin: false,
                isAuthenticated: true,
            });
            setIsLoading(false);
            setHasLoaded(true);
        };

        const validateToken = async () => {
            const response = await getAsync<GetSiginStatusQuery.Response>(API_ROUTES.access.isAuthenticated, null, {
                stopAutoRedirect: false,
            });

            if (!isAuthenticated && !!response?.redirectUrl) {
                setLocation(response?.redirectUrl);
            } else if (isSuccessResponse(response) && !!response.data?.isAuthenticated) {
                setIsAuthenticated(true);

                let lastName = '';
                if (response && response.data.claims['lastName'] === 'Last name') {
                    lastName = '';
                } else {
                    lastName = response.data.claims['lastName'];
                }

                setUser({
                    name: `${response.data.claims['firstName']} ${lastName}`,
                    firstName: `${response.data.claims['firstName']}`,
                    lastName: `${response.data.claims['lastName']}`,
                    email: response.data.claims['email'],
                    profile: response.data.claims['profileType'],
                    businessName: response.data.claims['businessName'],
                    userMenu: response.data.userMenu,
                    isVerified: response.data.isVerified,
                    isAdmin:
                        response.data.claims['role'] === 'http://cyber-auth.gc.ca/business/user/role/administrator',
                    isAuthenticated: response.data.isAuthenticated,
                });
            } else {
                setIsAuthenticated(false);
            }

            setIsLoading(false);
            setHasLoaded(true);
        };

        if (!hasLoaded) {
            if (isDemoMode()) {
                // No UIAM to call, so stand in a signed-in user rather than
                // redirecting to a sign-in endpoint that cannot be reached.
                signInDemoUser();
                return;
            }

            setIsLoading(true);
            validateToken();
        }
    }, [isAuthenticated]);

    const login = (user: User) => {
        setUser(user);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const getCurrentUser = () => {
        return user;
    };

    return (
        <AuthContext.Provider value={{ hasLoaded, isLoading, isAuthenticated, getCurrentUser, login, logout }}>
            {isLoading && (
                <GoabCircularProgress
                    variant="fullscreen"
                    size="small"
                    message="Getting ready..."
                    visible={true}
                ></GoabCircularProgress>
            )}
            {children}
        </AuthContext.Provider>
    );
};

const ProfileRoute: React.FC<{ children: ReactNode; profile: string }> = ({
    children,
    profile,
}): React.ReactElement => {
    const { isAuthenticated, getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const profiles = user?.profile?.split(',') || [];

    if (!isAuthenticated || !profiles.includes(profile)) {
        return <Navigate to="/no-access" />;
    }

    return <>{children}</>;
};

const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { useAuth, ProfileRoute };
