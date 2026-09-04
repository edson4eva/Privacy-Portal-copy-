import { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { GoabButton } from '@abgov/react-components';

export const AccessTokenRoute: React.FC<IPageSetting> = ({ title }: IPageSetting) => {
    const [token, setToken] = useState('');
    // const [isTokenValid, setIsTokenValid] = useState<boolean | undefined>(undefined)
    // const [claims, setClaims] = useState<string>("")
    const [data, setData] = useState<{ status: string; data: string; message: string } | null>(null);
    const tokenServiceEndpoint = 'https://uiamdataapi-syst2-e8abgxa5a9a3b4hc.canadacentral-01.azurewebsites.net';
    const privacyServiceEndpoint = 'https://uiamdataapi-syst2-e8abgxa5a9a3b4hc.canadacentral-01.azurewebsites.net';

    const createToken = async () => {
        setToken('');
        const response = await axios.request<{ data: string }>({
            url: `${tokenServiceEndpoint}/api/v1/token`,
            method: 'post',
            data: {
                subject: `${process.env.NX_PUBLIC_API_URL}`, //   subject: `${import.meta.env.BASE_URL}`,
                audience: 'https://rp_2_site_url',
                scopes: ['privacy:log:read', 'privacy:log:write'],
            },
        });
        setToken(response.data.data);
    };

    const fetchData = async () => {
        setData(null);
        try {
            const response = await axios.request<{ status: string; data: string; message: string }>({
                url: `${privacyServiceEndpoint}/api/v1/privacy/log`,
                method: 'get',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                setData({
                    status: 'fail',
                    message: error.message,
                    data: error.stack || '',
                });
            }
        }
    };

    return (
        <>
            <p>
                <GoabButton onClick={createToken}>Create token</GoabButton>
            </p>
            <p>
                <code style={{ wordBreak: 'break-all' }}>{token}</code>
            </p>
            <p>
                <GoabButton onClick={fetchData}>Fetch Data</GoabButton>
            </p>
            <p>
                <code>{JSON.stringify(data)}</code>
            </p>
        </>
    );
};

export default AccessTokenRoute;
