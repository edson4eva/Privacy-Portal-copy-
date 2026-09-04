import { GoabBlock, GoabIcon } from '@abgov/react-components';
import styles from './ErrorBar.module.scss';

interface ErrorBarProperties {
    content: string;
}
const ErrorBar: React.FC<ErrorBarProperties> = ({ content }): React.ReactElement => {
    return (
        <div className={styles['error-content']}>
            <GoabBlock gap="s" direction="row" alignment="start">
                <GoabIcon type="alert-circle" size="large" opacity={1}></GoabIcon>
                {content}
            </GoabBlock>
        </div>
    );
};
export default ErrorBar;
