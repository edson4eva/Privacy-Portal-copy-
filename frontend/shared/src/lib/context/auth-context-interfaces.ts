import { SideMenuItem } from '../app-side-menu';

interface User {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: string;
    businessName: string | undefined;
    userMenu: {
        top: SideMenuItem[] | null;
        left: SideMenuItem[] | null;
    };
    isVerified: boolean;
    isAdmin: boolean;
    isAuthenticated: boolean;
}

export { User };
