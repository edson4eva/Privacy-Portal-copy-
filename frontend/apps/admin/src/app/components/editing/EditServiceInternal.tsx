import { useState } from 'react';
import {
    GoabBlock,
    GoabButton,
    GoabButtonGroup,
    GoabCircularProgress,
    GoabFormItem,
    GoabGrid,
    GoabIcon,
    GoabInput,
    GoabRadioGroup,
    GoabRadioItem,
    GoabSpacer,
} from '@abgov/react-components';
import styles from './Section.module.scss';
import { put } from 'shared/src/lib/api/dataService';
import { ServiceDetailModel } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';
import { ServiceDetailDto } from '../../types/ServiceDetailDto';
import { InputComponent } from './InputComponent';
import * as Yup from 'yup';
import { useEditLockContext } from '../../context/EditLockContext';
import { ErrorMessage } from '../error/ErrorMessage';
import axios from 'axios';
import { extractAxiosError, VALIDATION_ERRORS } from '../../utils/apiUtils';

interface EditServiceInternalProperties {
    model: ServiceDetailModel;
}
const ServiceInternalYupSchema = Yup.object({
    rpId: Yup.string().test('rpId-required-if-origin-UIAM', 'RP ID Prod is required', function (value) {
        const { origin } = this.parent;
        return origin !== 'UIAM' || (origin === 'UIAM' && !!value);
    }),
    rpIdForUAT: Yup.string().test('rpIdForUAT-required-if-origin-UIAM', 'RP ID UAT is required', function (value) {
        const { origin } = this.parent;
        return origin !== 'UIAM' || (origin === 'UIAM' && !!value);
    }),
    sku: Yup.string().test('sku-required-if-origin-eServices', 'Sku  is required', function (value) {
        const { origin } = this.parent;
        return origin !== 'eServices' || (origin === 'eServices' && !!value);
    }),
});

const EditServiceInternal: React.FC<EditServiceInternalProperties> = ({ model }): React.ReactElement => {
    const [origin, setOrigin] = useState<string>(model.origin ?? '');
    const [sku, setSku] = useState<string>(model.sku ?? '');
    const [rPId, setRPId] = useState<string>(model.rpId ?? '');
    const [rPIdForUAT, setRPIdForUAT] = useState<string>(model.rpIdForUAT ?? '');
    const [busy, setBusy] = useState<boolean>(false);
    const [showSku, setShowSku] = useState<boolean>(model.origin === 'eServices');
    const [mockInDevelopment, setMockInDevelopment] = useState<boolean>(model.showMockInDev ? true : false);
    const [skuError, setSkuError] = useState<string | undefined>();
    const [rpidError, setRpidError] = useState<string | undefined>();
    const [rpidUatError, setRpidUatError] = useState<string | undefined>();
    const { editLock, isEditingInternalInfo, setIsEditingInternalInfo, setShowSaveMessage } = useEditLockContext();

    const validateData = async (formValues: ServiceDetailDto): Promise<boolean | Yup.ValidationError[]> => {
        try {
            await ServiceInternalYupSchema.validate(formValues, { abortEarly: false });
            return true;
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return error.inner;
            }
            return [];
        }
    };

    const processValidationResult = (errors: Yup.ValidationError[]) => {
        let currentError = errors.find((x) => x.path === 'rpId');
        setRpidError(currentError ? currentError.message : undefined);
        currentError = errors.find((x) => x.path === 'rpIdForUAT');
        setRpidUatError(currentError ? currentError.message : undefined);
        currentError = errors.find((x) => x.path === 'sku');
        setSkuError(currentError ? currentError.message : undefined);
    };
    const startEdit = () => {
        setIsEditingInternalInfo(true);
        setShowSaveMessage(false);
    };
    const cancel = () => {
        setSku(model.sku ?? '');
        setOrigin(model.origin ?? '');
        setRPId(model.rpId ?? '');
        setRPIdForUAT(model.rpIdForUAT ?? '');
        setMockInDevelopment(model.showMockInDev ? true : false);
        setShowSku(model.origin === 'eServices');
        setIsEditingInternalInfo(false);
    };
    const onOriginChanged = (selection: string) => {
        setShowSku(selection === 'eServices');
        setOrigin(selection);
    };
    const onSkuChanged = (value: string) => {
        setSku(value);
    };
    const onRPIdChanged = (value: string) => {
        setRPId(value);
    };
    const onUATRPIdChanged = (value: string) => {
        setRPIdForUAT(value);
    };
    const onMockAvailableChange = (value: string) => {
        setMockInDevelopment(value === '1');
    };
    const checkServerErrors = (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const errorString = extractAxiosError(error);
            switch (errorString) {
                case VALIDATION_ERRORS.RP_ID_MISSING:
                case VALIDATION_ERRORS.SERVICE_RPID_CONFLICT:
                case VALIDATION_ERRORS.RPID_TOO_LONG:
                    setRpidError(errorString);
                    break;
                case VALIDATION_ERRORS.RP_ID_UAT_MISSING:
                case VALIDATION_ERRORS.SERVICE_RPID_UAT_CONFLICT:
                case VALIDATION_ERRORS.RPID_UAT_TOO_LONG:
                    setRpidUatError(errorString);
                    break;
                case VALIDATION_ERRORS.SKU_MISSING:
                case VALIDATION_ERRORS.SERVICE_SKU_CONFLICT:
                case VALIDATION_ERRORS.SKU_TOO_LONG:
                    setSkuError(errorString);
                    break;
                default:
                    alert('Unexpected Service Error!');
            }
        } else {
            alert(error);
        }
    };
    const update = async () => {
        setBusy(true);
        try {
            let data = undefined;
            if (origin === 'UIAM') {
                data = {
                    origin: origin,
                    showMockInDev: mockInDevelopment,
                    rpId: rPId,
                    rpIdForUAT: rPIdForUAT,
                };
            } else {
                data = {
                    origin: origin,
                    showMockInDev: mockInDevelopment,
                    sku: sku,
                };
            }
            const validationResult = await validateData(data);
            if (validationResult === true) {
                const response = await put<ServiceDetailDto, ServiceDetailDto>(`/v1/services/${model.id}`, data, {
                    redirectOnError: false,
                });
                setSku(response.sku ?? '');
                setRPId(response.rpId ?? '');
                setRPIdForUAT(response.rpIdForUAT ?? '');
                setOrigin(response.origin ?? '');
                setIsEditingInternalInfo(false);
                setMockInDevelopment(response.showMockInDev === true);
            } else {
                if (Array.isArray(validationResult)) {
                    processValidationResult(validationResult);
                } else {
                    alert('Unknown validation error!');
                }
            }
        } catch (error) {
            checkServerErrors(error);
        }
        setBusy(false);
    };
    return (
        <div className={styles['edit-container']} role="internal">
            <div className={styles['section-header']}>
                <div className={styles['section-header-name']}>
                    <b>Service details (internal)</b>
                </div>
                {!isEditingInternalInfo && editLock.canEdit && (
                    <div className={styles['section-header-btn']}>
                        <GoabButton
                            onClick={startEdit}
                            leadingIcon="pencil"
                            type="tertiary"
                            size="compact"
                            disabled={isEditingInternalInfo}
                        >
                            Edit
                        </GoabButton>
                    </div>
                )}
            </div>
            <GoabSpacer vSpacing={'s'}></GoabSpacer>
            <p>
                The following details will be captured for internal purposes. Please reach out to the technical team for
                the service id and SKU numbers.
            </p>
            <GoabSpacer vSpacing={'s'}></GoabSpacer>
            {busy ? (
                <GoabCircularProgress
                    variant="inline"
                    size="small"
                    message="Saving..."
                    visible={busy}
                ></GoabCircularProgress>
            ) : isEditingInternalInfo ? (
                <>
                    <div className={styles['req-question-header']}>
                        Would you like a mock version of this service available in DEV?
                    </div>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <GoabFormItem>
                        <GoabRadioGroup
                            name="mock"
                            value={mockInDevelopment ? '1' : '2'}
                            onChange={({ value }) => {
                                onMockAvailableChange(value);
                            }}
                        >
                            <GoabRadioItem
                                value="1"
                                label="Yes - I want the service available for testing in DEV."
                            ></GoabRadioItem>
                            <GoabRadioItem
                                value="2"
                                label="No - I do not need to test this service in DEV."
                            ></GoabRadioItem>
                        </GoabRadioGroup>
                    </GoabFormItem>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <div className={styles['req-question-header']}>
                        Is the following service directly integrated with UIAM or eService?
                    </div>
                    <GoabFormItem>
                        <p>This is used to retrieve the service access history for the user.</p>
                        <GoabRadioGroup
                            name="origin"
                            value={origin}
                            onChange={({ value }) => {
                                onOriginChanged(value);
                            }}
                        >
                            <GoabRadioItem value="UIAM" label="UIAM"></GoabRadioItem>
                            <GoabRadioItem value="eServices" label="eServices"></GoabRadioItem>
                        </GoabRadioGroup>
                    </GoabFormItem>
                    {showSku ? (
                        <>
                            <div className={styles['req-question-header']}>SKU</div>
                            <InputComponent error={skuError}>
                                <GoabInput
                                    name="sku_input"
                                    type="text"
                                    value={sku}
                                    width="60ch"
                                    onChange={({ value }) => {
                                        onSkuChanged(value);
                                    }}
                                ></GoabInput>
                            </InputComponent>
                        </>
                    ) : (
                        <GoabGrid gap="m" minChildWidth="100px">
                            <div>
                                <div className={styles['req-question-header']}>Relying Party (RP) ID PROD</div>
                                <InputComponent error={rpidError}>
                                    <GoabInput
                                        name="rp1_input"
                                        type="text"
                                        value={rPId}
                                        width="30ch"
                                        onChange={({ value }) => {
                                            onRPIdChanged(value);
                                        }}
                                    ></GoabInput>
                                </InputComponent>
                            </div>
                            <div>
                                <div className={styles['req-question-header']}>Relying Party (RP) ID UAT</div>
                                <InputComponent error={rpidUatError}>
                                    <GoabInput
                                        name="rp2_input"
                                        type="text"
                                        value={rPIdForUAT}
                                        width="30ch"
                                        onChange={({ value }) => {
                                            onUATRPIdChanged(value);
                                        }}
                                    ></GoabInput>
                                </InputComponent>
                            </div>
                        </GoabGrid>
                    )}
                    <GoabButtonGroup alignment="start" mt="l">
                        <GoabButton onClick={cancel} type="secondary">
                            Cancel
                        </GoabButton>
                        <GoabButton type="primary" onClick={update}>
                            Save
                        </GoabButton>
                    </GoabButtonGroup>
                </>
            ) : (
                <>
                    <GoabBlock gap="s" direction="row" alignment="start">
                        <div className={styles['yellow-circle']}>
                            <GoabIcon type="alert-circle" theme="outline" opacity={1}></GoabIcon>
                        </div>
                        This information is not shown at the Service details page by the user.
                    </GoabBlock>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <b>Would you like a mock version of this service available in DEV?</b>
                    <div>{mockInDevelopment ? 'Yes' : 'No'}</div>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <GoabGrid gap="m" minChildWidth="100px">
                        <div>
                            <div>
                                <b>Service origin</b>
                            </div>
                            <div>{origin}</div>
                        </div>
                        <div>
                            {showSku && (
                                <>
                                    <div>
                                        <b>SKU</b>
                                    </div>
                                    <div>{sku}</div>
                                </>
                            )}
                        </div>
                    </GoabGrid>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    {!showSku && (
                        <GoabGrid gap="m" minChildWidth="100px">
                            <div>
                                <div>
                                    <b>Relying Party (RP) ID PROD</b>
                                </div>
                                <div>{rPId}</div>
                            </div>
                            <div>
                                <div>
                                    <b>Relying Party (RP) ID UAT</b>
                                </div>
                                <div>{rPIdForUAT}</div>
                            </div>
                        </GoabGrid>
                    )}
                </>
            )}
        </div>
    );
};

export default EditServiceInternal;
