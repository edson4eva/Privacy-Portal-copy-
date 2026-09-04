import styles from './PreviewBanner.module.scss';
interface PreviewBannerProperties {
    isAdminPanel: boolean;
    isPreview: boolean;
}
const PreviewBanner: React.FC<PreviewBannerProperties> = ({ isAdminPanel, isPreview }): React.ReactElement => {
    let heading = '';
    let message = '';
    if (isAdminPanel) {
        heading = 'Admin panel preview';
        message = 'This is a preview. Changes shown here are not published to any environment yet.';
    }
    if (!isAdminPanel && isPreview) {
        const environment = process.env.NX_PUBLIC_ENV;
        heading = `${environment} Preview`;
        message = `This is a preview. Changes made here are not published to the ${environment} environment yet.`;
    }
    return isAdminPanel || isPreview ? (
        <div className={styles['banner']}>
            <div className={styles['heading']}>{heading}</div>
            <div className={styles['message']}>{message}</div>
        </div>
    ) : (
        <></>
    );
};

export default PreviewBanner;
