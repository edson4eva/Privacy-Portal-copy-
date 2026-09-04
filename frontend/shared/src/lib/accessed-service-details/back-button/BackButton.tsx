import { GoabButton, GoabIcon, GoabSpacer } from '@abgov/react-components';
import styles from './BackButton.module.scss';
interface BackButtonProperties {
    buttonText: string;
    onClick: () => void;
}
const BackButton: React.FC<BackButtonProperties> = ({ buttonText, onClick }): React.ReactElement => {
    return (
        <>
            <div className={styles['non-mobile-back-button']} data-testid="non-mobile-back-button">
                <GoabSpacer vSpacing={'xl'}></GoabSpacer>
                <div>
                    <GoabButton
                        type="tertiary"
                        leadingIcon="arrow-back"
                        onClick={onClick}
                        testId="non-mobile-back-button-btn"
                    >
                        {buttonText}
                    </GoabButton>
                </div>
                <GoabSpacer vSpacing={'2xl'}></GoabSpacer>
            </div>
            <div className={styles['mobile-back-button']} onClick={onClick} data-testid="mobile-back-button">
                <div className={styles['icon']}>
                    <GoabIcon type="chevron-back" fillColor="#0070C4" testId="mobile-back-button-icon"></GoabIcon>
                </div>
                <div className={styles['text']} data-testid="mobile-back-button-text">
                    {buttonText}
                </div>
            </div>
        </>
    );
};
export default BackButton;
