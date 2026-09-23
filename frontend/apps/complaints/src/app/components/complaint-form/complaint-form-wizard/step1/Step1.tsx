/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, Controller } from 'react-hook-form';
import { GoabDropdown, GoabDropdownItem, GoabFormItem, GoabTextarea } from '@abgov/react-components';
import departments from 'shared/src/lib/models/department-code';
import { getSasToken } from 'shared/src/lib/api/azureBlobService';
import { useEffect } from 'react';
import MandatoryFieldLabel from 'shared/src/lib/mandatory-field-label/MandatoryFieldLabel';
import WarningIndicator from 'shared/src/lib/warning-indicator/WarningIndicator';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import styles from './Step1.module.scss';

interface Step1Property {
    control: Control<any>;
    correlationId: string;
}

const Step1 = ({ control, correlationId }: Step1Property): React.ReactElement => {
    const windowWidth = useWindowWidth();
    useEffect(() => {
        getSasToken(correlationId);
    }, [correlationId]);

    return (
        <div className={styles['step-container']}>
            {windowWidth < 624 && (
                <>
                    <PageTitle title="FILE A COMPLAINT" />
                    <PpSpacer vSpacing="s"></PpSpacer>
                    <PageSubTitle subTitle="Select department" />
                    <PpSpacer vSpacing="s"></PpSpacer>
                </>
            )}
            {windowWidth > 624 && <PpSpacer vSpacing="xl"></PpSpacer>}
            <p>Please select the relevant department you would like to file a complaint against:</p>
            <PpSpacer vSpacing="m"></PpSpacer>
            <GoabFormItem>
                <MandatoryFieldLabel label="Department"></MandatoryFieldLabel>
                <Controller
                    name="department"
                    control={control}
                    render={({ field, fieldState }) => (
                        <>
                            <GoabDropdown
                                name={field.name}
                                placeholder="Select"
                                value={field.value}
                                error={!!fieldState?.error}
                                onChange={({ value }) => {
                                    field.onChange(value);
                                }}
                                testId="select-department-dropdown"
                            >
                                {departments.map((department) => (
                                    <GoabDropdownItem
                                        key={department.key}
                                        value={department.key}
                                        label={department.value}
                                    ></GoabDropdownItem>
                                ))}
                            </GoabDropdown>
                            {fieldState?.error && (
                                <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                            )}
                        </>
                    )}
                />
            </GoabFormItem>
            <PpSpacer vSpacing="xl"></PpSpacer>
            If applicable, please provide the service name where your personal information was improperly accessed,
            collected, used, disclosed, or destroyed.
            <PpSpacer vSpacing="l"></PpSpacer>
            <GoabFormItem label="Service" requirement="optional" helpText="Include information about the service">
                <Controller
                    name="service"
                    control={control}
                    render={({ field }) => (
                        <>
                            <GoabTextarea
                                width="100%"
                                name={field.name}
                                onChange={({ value }) => {
                                    field.onChange(value);
                                }}
                                value={field.value}
                                countBy="character"
                                maxCount={250}
                                testId="service-text-area"
                            ></GoabTextarea>
                        </>
                    )}
                />
            </GoabFormItem>
        </div>
    );
};

export default Step1;
