import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAsync, isSuccessResponse } from 'shared/src/lib/api';
import { UIAM_API_ROOT } from 'shared/src/lib/authentication/auth-routes';
import { isDemoMode } from 'shared/src/lib/utils/demoMode';

export function ComplaintRedirect(): React.ReactElement {
    const navigate = useNavigate();

    const [isGuest, setIsGuest] = useState<boolean | null>(null);

    useEffect(() => {
        if (isDemoMode()) {
            // The UIAM token check cannot succeed here, so go straight to the
            // complaint flow instead of bouncing through the landing page.
            setIsGuest(false);
            navigate('/file-complaint');
            return;
        }

        async function fetchData() {
            const response = await getAsync<{ accessedServices: [] }>(UIAM_API_ROOT + 'is-login-token-valid');
            if (!isSuccessResponse(response)) {
                setIsGuest(true);
                navigate('/landing');
            } else {
                setIsGuest(false);
                navigate('/file-complaint');
            }
        }
        fetchData();
    });

    if (isGuest === null) {
        return <p>loading...</p>;
    }

    return isGuest ? <p>You are not signed in, redirecting...</p> : <p>You are signed in, redirecting...</p>;
}
