import styles from './StaleBanner.module.scss';
interface StaleBannerProperties {
    isStale: boolean;
}
const StaleBanner: React.FC<StaleBannerProperties> = ({ isStale }): React.ReactElement => {
    if (!isStale) return <></>;
    return (
        <div className={styles['banner']}>
            <div className={styles['heading']}>Stale Data Notice</div>
            <div className={styles['message']}>
                You're seeing a cached version of the accessed services. This data may be outdated due to temporary
                service issues.
            </div>
        </div>
    );
};

export default StaleBanner;
