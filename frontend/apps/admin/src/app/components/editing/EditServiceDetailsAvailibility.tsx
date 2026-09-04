import { useState } from 'react';
import { GoabCircularProgress, GoabFormItem, GoabRadioGroup, GoabRadioItem, GoabSpacer } from '@abgov/react-components';
import styles from './Section.module.scss';
import { put } from 'shared/src/lib/api/dataService';
import { ServiceDetailModel } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';
import { ServiceDetailDto } from '../../types/ServiceDetailDto';
import { useEditLockContext } from '../../context/EditLockContext';

interface EditServiceDetailsAvailibilityProperties {
    isAvailable: boolean | undefined;
    serviceId: string;
    valueChanged: (value: boolean, object?: ServiceDetailModel) => void;
}

const EditServiceDetailsAvailibility: React.FC<EditServiceDetailsAvailibilityProperties> = ({
    isAvailable,
    serviceId,
    valueChanged,
}): React.ReactElement => {
    const { editLock, setEditLock } = useEditLockContext();
    const [available, setAvailable] = useState<string>(isAvailable === true ? '1' : '2');
    const [busy, setBusy] = useState<boolean>(false);

    const onAvailableChange = async (value: string) => {
        setAvailable(value);
        try {
            const newValue = value === '1';
            const response = await put<ServiceDetailModel, ServiceDetailDto>(
                `/v1/services/${serviceId}`,
                {
                    isAvailable: newValue,
                },
                {
                    redirectOnError: false,
                }
            );
            valueChanged(newValue);
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div className={styles['service-available-container']}>
            <div className={styles['section-header']}>
                <div className={styles['service-available-label']}>Service details</div>
            </div>
            <div className={styles['service-available-desc']}>
                Service details are sourced from existing PIBs and validated with the program area before publishing on
                the Privacy Portal
            </div>

            <GoabSpacer vSpacing={'s'}></GoabSpacer>
            <b>Are the service details available right now?</b>
            <GoabSpacer vSpacing={'s'}></GoabSpacer>

            {busy ? (
                <GoabCircularProgress
                    variant="inline"
                    size="small"
                    message="Saving..."
                    visible={busy}
                ></GoabCircularProgress>
            ) : editLock.canEdit ? (
                <GoabFormItem>
                    <GoabRadioGroup
                        name="availability"
                        disabled={!editLock.canEdit}
                        value={available}
                        onChange={({ value }) => {
                            onAvailableChange(value);
                        }}
                    >
                        <GoabRadioItem
                            value="1"
                            label="Yes, service details are available."
                            description="The service detail accordions and their corresponding information will be displayed."
                        ></GoabRadioItem>
                        <GoabRadioItem
                            value="2"
                            label="No, service details are not available."
                            description="A modal window with the message 'Service details coming soon' will appear."
                        ></GoabRadioItem>
                    </GoabRadioGroup>
                </GoabFormItem>
            ) : (
                <>
                    {available === '1' ? (
                        <div>Yes, service details are available.</div>
                    ) : (
                        <div>No, service details are not available.</div>
                    )}
                </>
            )}
        </div>
    );
};

export default EditServiceDetailsAvailibility;
