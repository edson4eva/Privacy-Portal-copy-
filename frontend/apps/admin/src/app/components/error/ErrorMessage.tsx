import { GoabIcon } from '@abgov/react-components';
import styles from './ErrorMessage.module.scss';
import { PALETTE } from 'shared/src/lib/style/palette';

interface InputProperties {
    error: string | undefined;
}
export const ErrorMessage: React.FC<InputProperties> = ({ error }): React.ReactElement => {
    return (
        <>
            {error && (
                <div className={styles['input-error-div']}>
                    <GoabIcon
                        type="warning"
                        size="medium"
                        theme="filled"
                        opacity={1}
                        fillColor={PALETTE.error}
                    ></GoabIcon>
                    <div className={styles['input-error-text']}>{error}</div>
                </div>
            )}
        </>
    );
};
