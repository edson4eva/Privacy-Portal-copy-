import styles from './MandatoryFieldLabel.module.scss';

interface MandatoryFieldLabelProperties {
    label: string | undefined;
}

const MandatoryFieldLabel = ({ label }: MandatoryFieldLabelProperties): React.ReactElement => {
    return (
        <div className={styles['label']}>
            <b>{label}</b> <span className={styles['required']}>*</span>
        </div>
    );
};

export default MandatoryFieldLabel;
