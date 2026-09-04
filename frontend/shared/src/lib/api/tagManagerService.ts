declare const gtag: any;

export const trackEvent = (data: { action: string; category: string; label: string }) => {
    const { action, category, label } = data;

    if ((window as any)['gtag']) {
        gtag('event', action, {
            // eslint-disable-next-line camelcase
            event_category: category,
            // eslint-disable-next-line camelcase
            event_label: label,
        });
    }
};
