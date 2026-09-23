import { GoabButton, GoabButtonGroup, GoabIcon, GoabModal } from '@abgov/react-components';
import styles from './ErrorDialog.module.scss';
import { PALETTE } from 'shared/src/lib/style/palette';

export const ErrorDialog: React.FC<{
    heading: string;
    error: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ heading, error, open, setOpen }): React.ReactElement => {
    return (
        <GoabModal
            heading={
                <div className={styles['input-error-div']}>
                    <GoabIcon
                        type="warning"
                        size="medium"
                        theme="filled"
                        opacity={1}
                        fillColor={PALETTE.error}
                    ></GoabIcon>
                    <div className={styles['heading']}>{heading}</div>
                </div>
            }
            calloutVariant="emergency"
            open={open}
            actions={
                <GoabButtonGroup alignment="end">
                    <GoabButton type="primary" onClick={() => setOpen(false)}>
                        Ok
                    </GoabButton>
                </GoabButtonGroup>
            }
        >
            <div className={styles['content']}>{error}</div>
        </GoabModal>
    );
};
