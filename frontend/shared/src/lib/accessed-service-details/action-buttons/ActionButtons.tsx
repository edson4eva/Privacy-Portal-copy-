import { GoabButton } from '@abgov/react-components';
import styles from './ActionButtons.module.scss';

const ActionButtons: React.FC<{
    isAdminPanel: boolean;
    onBack: () => void;
    onAccessService: () => void;
}> = ({ isAdminPanel, onBack, onAccessService }) => (
    <div className={styles['button-container']} data-testid="button-container">
        <GoabButton
            disabled={isAdminPanel}
            width="16.875rem"
            type="secondary"
            variant="normal"
            leadingIcon="arrow-back"
            onClick={onBack}
            testId="btn-back-to-account-history"
        >
            Back to services accessed
        </GoabButton>
        <GoabButton
            width="10.625rem"
            type="primary"
            variant="normal"
            onClick={onAccessService}
            testId="btn-access-service"
        >
            Access service
        </GoabButton>
    </div>
);

export default ActionButtons;
