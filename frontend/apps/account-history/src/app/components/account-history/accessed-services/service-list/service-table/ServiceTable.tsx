import { GoabTable } from '@abgov/react-components';
import styles from './ServiceTable.module.scss';
import { Link } from 'react-router-dom';
import { AccessedServiceVm } from '../../../../../types/AccessedService';
const ServiceTable = ({
    currentPageServices,
    servicesCount,
    isPreview,
}: {
    currentPageServices: AccessedServiceVm[];
    servicesCount: number;
    isPreview: boolean;
}) => {
    return (
        <div className={styles['table-container']} data-testid="table-container">
            <GoabTable width="100%" testId="services-table">
                <thead className={styles['tbl-thead']}>
                    <tr>
                        <th>
                            <div className={styles['th-service-accessed']}>
                                <div>Service accessed</div>
                                <div className={styles['services-count']}>{servicesCount}</div>
                            </div>
                        </th>
                        <th>Date accessed</th>
                        <th className={styles['col-time']}>Time</th>
                        <th>Details</th>
                        <th>Privacy Details</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPageServices.map((service, index) => {
                        return (
                            <tr key={index}>
                                <td>{service.serviceName}</td>
                                <td>{service.dateAccessed}</td>
                                <td className={styles['col-time']}>{service.timeAccessed}</td>
                                <td>
                                    <Link
                                        to={
                                            isPreview
                                                ? `/preview/accessed-services/${service.id}`
                                                : `/accessed-services/${service.id}`
                                        }
                                        data-testid={`view-${service.id}`}
                                    >
                                        View
                                    </Link>
                                </td>
                                <td>
                                    {/* The complaints app is a separate deployment, so this is a
                                        plain anchor driven by the same env var the unauthorized
                                        access notice uses - a router link would resolve inside
                                        this app's basename. */}
                                    <a
                                        href={process.env.NX_PUBLIC_COMPLAINTS_BASE_HREF + 'file-complaint'}
                                        target="_self"
                                        data-testid={`file-complaint-${service.id}`}
                                    >
                                        File a privacy complaint
                                    </a>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </GoabTable>
        </div>
    );
};

export default ServiceTable;
