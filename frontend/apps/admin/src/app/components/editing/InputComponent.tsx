import { GoabIcon } from '@abgov/react-components';
import styles from './InputComponent.module.scss';
import { PALETTE } from 'shared/src/lib/style/palette';

interface InputProperties {
    error: string | undefined;
    children: React.ReactNode;
}
export const InputComponent: React.FC<InputProperties> = ({ error, children }): React.ReactElement => {
    return (
        <div className={styles['input-container']}>
            <div className={error ? styles['input-error'] : styles['input']}>{children}</div>
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
        </div>
    );
};
