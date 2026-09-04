export const initializeGoogleAnalytics = (): void => {
    if (process.env.NX_PUBLIC_GOOGLE_ANALYTICS_KEY && process.env.JEST_WORKER_ID === undefined) {
        const key = process.env.NX_PUBLIC_GOOGLE_ANALYTICS_KEY;
        const sdk = document.createElement('script');
        sdk.src = `https://www.googletagmanager.com/gtag/js?id=${key}`;
        sdk.async = true;

        document.head.appendChild(sdk);

        const initScript = document.createElement('script');
        initScript.innerText = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${key}');
        `;
        document.head.appendChild(initScript);
    }
};
