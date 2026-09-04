import { GoabSpacer } from '@abgov/react-components';
import styles from './ErrorPage.module.scss';

const ErrorPage = (): React.ReactElement => {
    return (
        <>
            <div className={styles['error-image']}>
                <img alt="" src="./assets/unexpected-error.png" style={{ height: 177, width: 334 }}></img>
            </div>
            <GoabSpacer vSpacing="xl"></GoabSpacer>
            <div className={styles['ooops']}>Ooops!</div>
            <GoabSpacer vSpacing="s"></GoabSpacer>
            <div className={styles['error-text']}>
                Something unexpected happened. Please try again by reloading the page.
            </div>
            <GoabSpacer vSpacing="s"></GoabSpacer>
        </>
    );
};

export default ErrorPage;
