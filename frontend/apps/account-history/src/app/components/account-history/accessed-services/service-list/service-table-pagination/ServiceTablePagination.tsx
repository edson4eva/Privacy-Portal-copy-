import { GoabPagination } from '@abgov/react-components';
import styles from './ServiceTablePagination.module.scss';

const ServiceTablePagination = ({
    servicesCount,
    currentPage,
    perPageCount,
    prepareCurrentPageServices,
}: {
    servicesCount: number;
    currentPage: number;
    perPageCount: number;
    prepareCurrentPageServices: (page: number) => void;
}) => {
    return (
        <div className={styles['pagination-container']} data-testid="pagination-container">
            <GoabPagination
                testId="services-table-pagination"
                itemCount={servicesCount}
                perPageCount={perPageCount}
                pageNumber={currentPage}
                onChange={({ page }) => {
                    prepareCurrentPageServices(page);
                    setTimeout(() => (document.activeElement as HTMLElement | null)?.blur(), 0);
                }}
            />
        </div>
    );
};
export default ServiceTablePagination;
