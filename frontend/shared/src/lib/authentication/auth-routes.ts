export const API_ROOT = process.env.NX_PUBLIC_API_URL;
export const BASE_URL = process.env.NX_PUBLIC_BASE_HREF;
export const UIAM_API_ROOT = process.env.NX_PUBLIC_UIAM_API_URL;

export const API_ROUTES = {
    access: {
        isAuthenticated: `${API_ROOT}v1/is-authenticated`,
        signin: `${API_ROOT}v1/signin`,
        signout: `${API_ROOT}v1/signout`,
    },
} as const;

/**
 * Where signing out lands while demo mode is on. The apps are mounted under
 * their own paths behind one host there, so this is configured rather than
 * assumed, and falls back to the host root.
 */
export const DEMO_SIGN_IN_HREF = process.env.NX_PUBLIC_DEMO_SIGN_IN_HREF || '/';

export const SHARED_ROUTES = {
    public: '/',
    signin: '/signin',
    signinRedirect: '/signin_redirect',
    signout: '/signout',
    signedOut: '/signed-out',
    accessToken: '/access-token',
    base: '/',
} as const;
