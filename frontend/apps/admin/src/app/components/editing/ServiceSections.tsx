import React, { ReactNode, useState } from 'react';
import styles from './Section.module.scss';
import EditSection from './EditSection';
import { ServiceDetailSection } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';
import { SectionEditStatus, useEditLockContext } from '../../context/EditLockContext';

interface SectionProperties {
    items: ServiceDetailSection[];
    serviceId: string;
    deleteHandler: (index: number) => Promise<boolean>;
}

const ServiceSections: React.FC<SectionProperties> = ({ items, serviceId, deleteHandler }) => {
    return (
        <div className={styles.container}>
            {items.map((item, index) => (
                <EditSection
                    section={item}
                    index={index}
                    serviceId={serviceId}
                    key={index}
                    deleteHandler={deleteHandler}
                />
            ))}
        </div>
    );
};

export default ServiceSections;
