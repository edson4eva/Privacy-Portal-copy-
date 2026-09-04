import { useState } from 'react';
import { GoabBlock, GoabIcon, GoabSpacer } from '@abgov/react-components';
import styles from './Section.module.scss';
import { ServiceDetailModel } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';

interface HistorySectionProperties {
    model: ServiceDetailModel;
}

const HistorySection: React.FC<HistorySectionProperties> = ({ model }): React.ReactElement => {
    return (
        <div className={styles['service-history-container']}>
            <div className={styles['section-header']}>
                <div className={styles['service-history-label']}>Service access history</div>
            </div>
            <p>This log shows when you have accessed the service through your Alberta.ca Account.</p>
            <GoabSpacer vSpacing={'s'}></GoabSpacer>
            <div className={styles['edit-container']} role="internal">
                <b>Service log goes here</b>
                <GoabSpacer vSpacing={'s'}></GoabSpacer>
                <GoabBlock gap="s" direction="row" alignment="start">
                    <div className={styles['yellow-circle']}>
                        <GoabIcon type="alert-circle" theme="outline" opacity={1}></GoabIcon>
                    </div>
                    No action to be made.
                </GoabBlock>
            </div>
        </div>
    );
};

export default HistorySection;
