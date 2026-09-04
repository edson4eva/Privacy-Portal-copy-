import { GoabIcon } from '@abgov/react-components';
import styles from './WarningIndicator.module.scss';

interface WarningIndicatorProperties {
    message: string | undefined;
}

const WarningIndicator = ({ message }: WarningIndicatorProperties): React.ReactElement => {
    return (
        <div className={styles['warning-indicator']}>
            <GoabIcon type="warning" size="small" theme="filled" opacity={1} fillColor="red"></GoabIcon>
            <span className={styles['message']} data-testid="warning-indicator">
                {message}
            </span>
        </div>
    );
};

export default WarningIndicator;
