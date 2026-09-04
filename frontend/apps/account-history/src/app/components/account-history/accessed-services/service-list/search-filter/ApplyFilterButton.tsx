import { GoabButton } from '@abgov/react-components';
import styles from './ApplyFilterButton.module.scss';
interface ApplyFilterButtonProperties {
    applyFilters: () => void;
}

const ApplyFilterButton: React.FC<ApplyFilterButtonProperties> = ({ applyFilters }) => {
    return (
        <div className={styles['services-filter-btn-container']}>
            <div className={styles['services-filter-btn']}>
                <GoabButton onClick={applyFilters} width="100%">
                    View services
                </GoabButton>
            </div>
        </div>
    );
};
export default ApplyFilterButton;
