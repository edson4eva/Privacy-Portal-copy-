import { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <AuthProvider>{children}</AuthProvider>
        </>
    );
};
