import { GoabButton, GoabButtonGroup, GoabIcon, GoabModal } from '@abgov/react-components';
import styles from './WarnDialog.module.scss';

export const WarnDialog: React.FC<{
    header: string;
    message: string;
    proceed: () => void;
    cancel: () => void;
}> = ({ header, message, proceed, cancel }) => {
    return (
        <GoabModal
            heading={
                <div className={styles['modal-header']}>
                    <div className={styles['header-icon-yellow-circle']}>
                        <GoabIcon type="alert-circle" theme="outline" opacity={1}></GoabIcon>
                    </div>
                    <div className={styles['header-text']}>{header}</div>
                </div>
            }
            open={true}
            role="alertdialog"
            actions={
                <GoabButtonGroup alignment="end">
                    <GoabButton
                        type="secondary"
                        variant="normal"
                        onClick={() => {
                            proceed();
                        }}
                    >
                        Leave without saving
                    </GoabButton>
                    <GoabButton
                        type="primary"
                        variant="normal"
                        onClick={() => {
                            cancel();
                        }}
                    >
                        Stay on page
                    </GoabButton>
                </GoabButtonGroup>
            }
        >
            <div>{message}</div>
        </GoabModal>
    );
};
