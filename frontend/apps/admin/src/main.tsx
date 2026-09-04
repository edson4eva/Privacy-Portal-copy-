import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import { AppDataProvider } from 'shared/src/lib/context/appdata-provider';

const source = process.env.NX_PUBLIC_PINGDOM_URL as string;

if (source) {
    const head = document.head;
    const script = document.createElement('script');
    script.src = process.env.NX_PUBLIC_PINGDOM_URL as string;
    script.async = true;

    head.appendChild(script);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <AppDataProvider>
        <StrictMode>
            <App />
        </StrictMode>
    </AppDataProvider>
);
