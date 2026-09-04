import { GoabBlock, GoabIcon } from '@abgov/react-components';
import { GoabIconType } from '@abgov/ui-components-common';
import styles from './ServiceProperty.module.scss';

const ServiceProperty: React.FC<{
    icon: GoabIconType;
    title: string;
    value: string | undefined;
    valueList?: string[] | undefined;
    testId?: string;
    isLight?: boolean;
}> = ({ icon, title, value, valueList, testId, isLight = false }) => (
    <div className={styles['service-propery-container']} data-testid={testId}>
        <div className={styles['header']}>
            <div className={styles['icon-container']}>
                <GoabIcon type={icon} />
            </div>
            <div className={styles['title']}>{title}</div>
        </div>
        {valueList ? (
            <div className={styles['badge-container']}>
                {valueList.map((value) => (
                    <div className={`${styles['badge']} ${isLight ? styles['light'] : ''}`} key={value}>
                        {value}
                    </div>
                ))}
            </div>
        ) : (
            <div className={`${styles['badge']} ${isLight ? styles['light'] : ''}`}>{value || ''}</div>
        )}
    </div>
);

export default ServiceProperty;
