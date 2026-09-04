import { GoabSpacer, GoabTable } from '@abgov/react-components';
import { AccessServiceDate } from '../types/AccessedServiceDetailsModel';
import styles from './AccessHistoryTable.module.scss';

const AccessHistoryTable: React.FC<{ accessedDates: AccessServiceDate[] }> = ({ accessedDates }) => (
    <>
        <div className={styles['service-access-history']} data-testid="service-access-history">
            Service access history
        </div>
        <GoabSpacer vSpacing="s" />
        <div className={styles['log-description']} data-testid="log-description">
            This log shows when you have accessed the service through your Alberta.ca Account.
        </div>
        <div className={styles['table-container']} data-testid="table-container">
            <GoabTable width="100%" testId="log-table">
                <thead className={styles['tbl-thead']}>
                    <tr>
                        <th data-default="Date accessed" />
                        <th data-default="Time accessed" />
                    </tr>
                </thead>
                <tbody>
                    {accessedDates?.map((date, index) => (
                        <tr key={index}>
                            <td>{date.formattedDate}</td>
                            <td>{date.formattedTime}</td>
                        </tr>
                    ))}
                </tbody>
            </GoabTable>
        </div>
    </>
);

export default AccessHistoryTable;
