export const initializePingdom = (): void => {
    if (process.env.NX_PUBLIC_PINGDOM_URL && process.env.JEST_WORKER_ID === undefined) {
        const sdk = document.createElement('script');
        sdk.src = process.env.NX_PUBLIC_PINGDOM_URL;
        sdk.async = true;

        document.head.appendChild(sdk);
    }
};
