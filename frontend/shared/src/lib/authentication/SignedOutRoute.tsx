import { GoabCircularProgress } from '@abgov/react-components';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SignedOutRoute: React.FC<IPageSetting> = ({ title }: IPageSetting) => {
    const navigate = useNavigate();

    useEffect(() => {
        // const redirectToSignIn = async () => {
        //     navigate('/');
        // };

        // redirectToSignIn();
        navigate('/');
    }, [title]);

    return (
        <>
            <GoabCircularProgress variant="inline" size="large" visible={true}></GoabCircularProgress>
        </>
    );
};

export default SignedOutRoute;
