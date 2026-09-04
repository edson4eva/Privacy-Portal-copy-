import styles from './EditLockCallout.module.css';

const EditLockCallout = (): React.ReactElement => {
    return (
        <div className={styles['lock-callout-container']}>
            <div className={styles['lock-header']}>Admin panel is locked</div>
            <div className={styles['lock-desc']}>
                To unlock the admin panel, either complete the publishing flow by publishing to PROD or roll back
                changes to continue editing
            </div>
        </div>
    );
};

export default EditLockCallout;
