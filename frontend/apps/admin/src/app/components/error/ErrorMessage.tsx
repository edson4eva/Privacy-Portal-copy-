import { GoabIcon } from '@abgov/react-components';
import styles from './ErrorMessage.module.scss';

interface InputProperties {
    error: string | undefined;
}
export const ErrorMessage: React.FC<InputProperties> = ({ error }): React.ReactElement => {
    return (
        <>
            {error && (
                <div className={styles['input-error-div']}>
                    <GoabIcon type="warning" size="medium" theme="filled" opacity={1} fillColor="#ec040b"></GoabIcon>
                    <div className={styles['input-error-text']}>{error}</div>
                </div>
            )}
        </>
    );
};
