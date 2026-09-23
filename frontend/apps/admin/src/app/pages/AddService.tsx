import React, { useEffect } from 'react';
import styles from './AddService.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import {
    GoabButton,
    GoabButtonGroup,
    GoabFormItem,
    GoabInput,
    GoabRadioGroup,
    GoabRadioItem,
    GoabSpacer,
    GoabDropdown,
    GoabDropdownItem,
    GoabModal,
    GoabIcon,
    GoabCircularProgress,
} from '@abgov/react-components';
import { useState } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { validateServiceData } from '../types/ServiceForm';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import { FileServiceAPIResponse, Service } from '../types/Service';
import RichTextEditor from '../components/editing/RichTextEditor';
import ErrorBar from '../components/error/ErrorBar';
import { Categories } from 'shared/src/lib/accessed-service-details/types/Constants';
import { MinistryOptions } from '../types/Constants';
import { ValidationError } from 'yup';
import { get, post } from 'shared/src/lib/api/dataService';
import { VALIDATION_ERRORS, extractAxiosError } from '../utils/apiUtils';
import { InputComponent } from '../components/editing/InputComponent';
import { ServiceDetailDto } from '../types/ServiceDetailDto';
import { PublishStatus, PublishWorkflowStatus } from '../types/PublishStatus';
import BackButton from 'shared/src/lib/accessed-service-details/back-button/BackButton';
import EditLockCallout from '../components/callout/EditLockCallout';
import { WarnDialog } from '../components/warn-dialog/WarnDialog';
import { MultiSelectDropdown, DropdownOption } from '../components/editing/MultiSelectDropdown';

const AddService = (): React.ReactElement => {
    const windowWidth = useWindowWidth();
    const navigate = useNavigate();

    const [response, setResponse] = useState('');
    const [serviceName, setServiceName] = useState<string>('');
    const [serviceNameError, setServiceNameError] = useState<string | undefined>();
    const [description, setDescription] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string | undefined>();

    const [categoryId, setCategoryId] = useState<string>('');
    const [categoryIdError, setCategoryIdError] = useState<string | undefined>();
    const [dataOwnerIdsError, setDataOwnerIdsError] = useState<string | undefined>();
    const [origin, setOrigin] = useState<string>('');
    const [originError, setOriginError] = useState<string | undefined>();
    const [rpId, setRpId] = useState<string>('');
    const [rpIdError, setRpIdError] = useState<string | undefined>();
    const [rpIdForUAT, setRpIdForUAT] = useState<string>('');
    const [rpIdForUATError, setRpIdForUATError] = useState<string | undefined>();
    const [sku, setSku] = useState<string>('');
    const [skuError, setSkuError] = useState<string | undefined>();
    const [accessServiceUrl, setAccessServiceUrl] = useState<string>('');
    const [accessServiceUrlError, setAccessServiceUrlError] = useState<string | undefined>();
    const [showMockInDevelopment, setShowMockInDevelopment] = useState<boolean | undefined>();
    const [showMockInDevelopmentError, setShowMockInDevelopmentError] = useState<string | undefined>();
    const [available, setAvailable] = useState<string>('');
    const [availableError, setAvailableError] = useState<string>();

    const [showSku, setShowSku] = useState<boolean>(false);
    const [showRpId, setShowRpId] = useState<boolean>(false);
    const [openLeaveDialog, setOpenLeaveDialog] = useState<boolean>(false);
    const [busy, setBusy] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(true);

    const [selectedMinistryOptions, setSelectedMinistryOptions] = useState<DropdownOption[]>([]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = ''; //for legacy browser
            return true;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);
    const blocker = useBlocker(() => {
        return true;
    });

    useEffect(() => {
        async function fetchData() {
            const response = await get<PublishWorkflowStatus>('/v1/admin/publish-status', { redirectOnError: false });
            if (response.status === PublishStatus.NotStarted || response.status === PublishStatus.Completed) {
                setCanEdit(true);
            } else {
                setCanEdit(false);
            }
        }
        fetchData();
    }, []);
    const onServiceNameChange = (value: string) => {
        setServiceName(value);
    };

    const onChangeDesc = (value: string) => {
        setDescription(value);
    };
    const onCategoryChanged = (value: string | string[]) => {
        if (typeof value === 'string') {
            setCategoryId(value);
        }
    };
    const onUrlChanged = (value: string) => {
        setAccessServiceUrl(value);
    };
    const onShowMockInDevelopmentChanged = (value: string) => {
        setShowMockInDevelopment(value === '1' ? true : false);
    };
    const onSkuChanged = (value: string) => {
        setSku(value);
    };
    const onRpIdChanged = (value: string) => {
        setRpId(value);
    };
    const onRpIdUATChanged = (value: string) => {
        setRpIdForUAT(value);
    };

    const onOriginChanged = (value: string) => {
        setShowSku(value === 'eServices');
        setShowRpId(value === 'UIAM');
        setOrigin(value);
    };
    const onAvailableChange = (value: string) => {
        setAvailable(value);
    };
    const navigateToServices = () => {
        navigate('/services');
    };

    const extractValidationError = (errors: ValidationError[], fieldName: string): ValidationError | undefined => {
        return errors.find((x) => x.path === fieldName);
    };
    const resetErrors = () => {
        setServiceNameError(undefined);
        setDescriptionError(undefined);
        setCategoryIdError(undefined);
        setDataOwnerIdsError(undefined);
        setShowMockInDevelopmentError(undefined);
        setAccessServiceUrlError(undefined);
        setOriginError(undefined);
        setRpIdError(undefined);
        setRpIdForUATError(undefined);
        setSkuError(undefined);
        setResponse('');
    };
    const processValidationResult = (errors: ValidationError[]) => {
        let currentError = extractValidationError(errors, 'serviceName');
        setServiceNameError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'description');
        setDescriptionError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'categoryId');
        setCategoryIdError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'dataOwnerIds');
        setDataOwnerIdsError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'showMockInDev');
        setShowMockInDevelopmentError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'accessServiceUrl');
        setAccessServiceUrlError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'origin');
        setOriginError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'rpId');
        setRpIdError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'rpIdForUAT');
        setRpIdForUATError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'sku');
        setSkuError(currentError ? currentError.message : undefined);
        currentError = extractValidationError(errors, 'isAvailable');
        setAvailableError(currentError ? currentError.message : undefined);
    };
    const handleSubmit = async () => {
        setBusy(true);
        const formData: ServiceDetailDto = {
            serviceName: serviceName,
            description: description,
            categoryId: categoryId,
            dataOwnerIds: selectedMinistryOptions.map((option) => option.value),
            origin: origin,
            rpId: rpId,
            rpIdForUAT: rpIdForUAT,
            sku: sku,
            accessServiceUrl: accessServiceUrl,
            showMockInDev: showMockInDevelopment,
        };
        if (available) {
            formData.isAvailable = available === '1' ? true : false;
        }
        const validationResult = await validateServiceData(formData);
        if (validationResult === true) {
            resetErrors();
            setBusy(true);
            try {
                const response = await post<FileServiceAPIResponse, ServiceDetailDto>('/v1/createservice', formData, {
                    redirectOnError: false,
                });
                navigate(`/services/${response.id}`);
            } catch (error) {
                const errorMessage = extractAxiosError(error);
                switch (errorMessage) {
                    case VALIDATION_ERRORS.SERVICE_NAME_MISSING:
                    case VALIDATION_ERRORS.SERVICE_NAME_TOO_LONG:
                    case VALIDATION_ERRORS.SERVICE_NAME_CONFLICT:
                        setServiceNameError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.SERVICE_DESC_MISSING:
                    case VALIDATION_ERRORS.SERVICE_DESC_TOO_LONG:
                        setDescriptionError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.CATEGORY_MISSING:
                    case VALIDATION_ERRORS.INVALID_CATEGORY:
                        setCategoryIdError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.DATA_OWNER_MISSING:
                    case VALIDATION_ERRORS.INVALID_DATAOWNER:
                        setDataOwnerIdsError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.SERVICE_LINK_MISSING:
                    case VALIDATION_ERRORS.INVALID_SERVICE_LINK:
                        setAccessServiceUrlError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.INVALID_ORIGIN:
                    case VALIDATION_ERRORS.ORIGIN_MISSING:
                        setOriginError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.RP_ID_MISSING:
                    case VALIDATION_ERRORS.SERVICE_RPID_CONFLICT:
                    case VALIDATION_ERRORS.RPID_TOO_LONG:
                        setRpIdError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.RP_ID_UAT_MISSING:
                    case VALIDATION_ERRORS.SERVICE_RPID_UAT_CONFLICT:
                    case VALIDATION_ERRORS.RPID_UAT_TOO_LONG:
                        setRpIdForUATError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.SKU_MISSING:
                    case VALIDATION_ERRORS.SERVICE_SKU_CONFLICT:
                    case VALIDATION_ERRORS.SKU_TOO_LONG:
                        setSkuError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.SHOW_MOCK_IN_DEV_MISSING:
                        setShowMockInDevelopmentError(errorMessage);
                        break;
                    case VALIDATION_ERRORS.SERVICE_AVAILABILITY_MISSING:
                        setAvailableError(errorMessage);
                        break;
                    default:
                        setResponse('Unexpected Service Error!');
                }
            }
            setBusy(false);
        } else if (Array.isArray(validationResult)) {
            processValidationResult(validationResult);
        }
        setBusy(false);
    };

    return (
        <>
            <div className={styles['top-div']}>
                <BackButton
                    buttonText={'Back to digital services'}
                    onClick={() => {
                        if (canEdit) {
                            setOpenLeaveDialog(true);
                        } else {
                            navigateToServices();
                        }
                    }}
                ></BackButton>
                <PageTitle title="DIGITAL SERVICES" />
                <GoabSpacer vSpacing={'s'}></GoabSpacer>
                <PageSubTitle subTitle="Add new service" />
                <div className={styles['section-header']}>Add a new service to the privacy portal</div>
            </div>
            {blocker.state === 'blocked' && (
                <WarnDialog
                    header="Changes not saved"
                    message="You have unsaved changes. If you leave this page, your changes will be lost. Do you want to continue without saving?"
                    proceed={() => {
                        blocker.proceed();
                    }}
                    cancel={() => blocker.reset()}
                />
            )}

            {busy && (
                <GoabCircularProgress
                    variant="fullscreen"
                    size="large"
                    message="Saving, please wait......"
                    visible={true}
                ></GoabCircularProgress>
            )}
            {!canEdit ? (
                <div className={styles['bottom-div']}>
                    <EditLockCallout />
                </div>
            ) : (
                <>
                    <div className={styles['container']}>
                        <div className={styles['section-header']}>
                            <div className={styles['section-header-name']}>
                                <b>Service details information</b>
                            </div>
                        </div>
                        <div>The following details will be shown to the user for this service.</div>
                        {response && <ErrorBar content={response}></ErrorBar>}
                        <GoabSpacer vSpacing={'l'}></GoabSpacer>
                        <div className={styles['req-question-header']}>Service name</div>
                        <InputComponent error={serviceNameError}>
                            <GoabFormItem>
                                <GoabInput
                                    name="serviceName"
                                    width="85ch"
                                    maxLength={100}
                                    value={serviceName}
                                    onChange={({ value }) => {
                                        onServiceNameChange(value);
                                    }}
                                ></GoabInput>
                            </GoabFormItem>
                        </InputComponent>
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>

                        <div className={styles['desc-div']}>
                            <div className={styles['req-question-header']}>Service description</div>
                            {canEdit && (
                                <InputComponent error={descriptionError}>
                                    <RichTextEditor content={description} onContentChange={onChangeDesc} height={200} />
                                </InputComponent>
                            )}
                        </div>
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>

                        <div className={styles['sidebyside']}>
                            <div>
                                <div className={styles['req-question-header']}>Category</div>
                                <InputComponent error={categoryIdError}>
                                    <GoabDropdown
                                        width="40ch"
                                        name="categoryId"
                                        placeholder="Select"
                                        value={categoryId}
                                        filterable={true}
                                        onChange={({ value }) => {
                                            onCategoryChanged(value ?? '');
                                        }}
                                    >
                                        {Categories.map((category, index) => (
                                            <GoabDropdownItem
                                                value={category.id}
                                                label={category.label}
                                                key={index}
                                            ></GoabDropdownItem>
                                        ))}
                                    </GoabDropdown>
                                </InputComponent>
                            </div>
                            <GoabSpacer hSpacing={'s'}></GoabSpacer>
                            <div style={{ flexGrow: 1, flexBasis: 'auto' }}>
                                <div className={styles['req-question-header']}>Ministry and Data owner</div>
                                <InputComponent error={dataOwnerIdsError}>
                                    <MultiSelectDropdown
                                        label="Ministry and Data owner"
                                        options={MinistryOptions}
                                        selectedOptions={selectedMinistryOptions}
                                        onChange={setSelectedMinistryOptions}
                                    />
                                </InputComponent>
                            </div>
                        </div>
                        <GoabSpacer vSpacing={'m'}></GoabSpacer>
                        <div>
                            This is the link to the service, accessible to the user via the Call to Action (CTA) at the
                            bottom of the page.
                        </div>
                        <GoabSpacer vSpacing={'m'}></GoabSpacer>
                        <div className={styles['req-question-header']}>Service access link</div>
                        <InputComponent error={accessServiceUrlError}>
                            <GoabInput
                                name="accessServiceUrl"
                                type="url"
                                value={accessServiceUrl}
                                width="85ch"
                                onChange={({ value }) => {
                                    onUrlChanged(value);
                                }}
                            ></GoabInput>
                        </InputComponent>
                    </div>
                    <GoabSpacer vSpacing="m"></GoabSpacer>
                    <div className={styles['container']} role="internal">
                        <div className={styles['section-header']}>
                            <div className={styles['section-header-name']}>
                                <b>Service details (internal)</b>
                            </div>
                        </div>
                        <div>The following details will be captured for internal purposes.</div>
                        <GoabSpacer vSpacing="l"></GoabSpacer>
                        <div className={styles['req-question-header']}>
                            Would you like a mock version of this service available in DEV?
                        </div>
                        <InputComponent error={showMockInDevelopmentError}>
                            <GoabFormItem>
                                <GoabRadioGroup
                                    name="mockInDev"
                                    value={
                                        showMockInDevelopment === undefined
                                            ? ''
                                            : showMockInDevelopment === true
                                              ? '1'
                                              : '2'
                                    }
                                    onChange={({ value }) => {
                                        onShowMockInDevelopmentChanged(value);
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
                        </InputComponent>
                        <GoabSpacer vSpacing="s"></GoabSpacer>
                        <div className={styles['req-question-header']}>
                            Is the following service directly integrated with UIAM or eService?
                        </div>
                        <GoabFormItem>
                            <p>This is used to retrieve the service access history for the user.</p>
                            <InputComponent error={originError}>
                                <GoabRadioGroup
                                    name="origin"
                                    value="1"
                                    onChange={({ value }) => {
                                        onOriginChanged(value);
                                    }}
                                >
                                    <GoabRadioItem value="UIAM" label="UIAM"></GoabRadioItem>
                                    <GoabRadioItem value="eServices" label="eServices"></GoabRadioItem>
                                </GoabRadioGroup>
                            </InputComponent>
                        </GoabFormItem>
                        {showSku && (
                            <>
                                <p>Please reach out to the technical team to obtain SKU for this service.</p>
                                <div className={styles['req-question-header']}>SKU</div>
                                <InputComponent error={skuError}>
                                    <GoabInput
                                        name="sku"
                                        type="text"
                                        value={sku}
                                        width="40ch"
                                        onChange={({ value }) => {
                                            onSkuChanged(value);
                                        }}
                                    ></GoabInput>
                                </InputComponent>
                            </>
                        )}
                        {showRpId && (
                            <>
                                <div className={styles['section-header']}>
                                    <div className={styles['section-header-name']}>Relying Party ID</div>
                                </div>
                                <p>
                                    Please reach out to the technical team to obtain Relying Party IDs for UAT and PROD.
                                </p>
                                <div className={styles['sidebyside']}>
                                    <div>
                                        <div className={styles['req-question-header']}>RP ID PROD</div>
                                        <InputComponent error={rpIdError}>
                                            <GoabInput
                                                name="rpId"
                                                width="30ch"
                                                value={rpId}
                                                onChange={({ value }) => {
                                                    onRpIdChanged(value);
                                                }}
                                            ></GoabInput>
                                        </InputComponent>
                                    </div>
                                    <GoabSpacer hSpacing="s"></GoabSpacer>
                                    <div>
                                        <div className={styles['req-question-header']}>RP ID UAT</div>
                                        <InputComponent error={rpIdForUATError}>
                                            <GoabInput
                                                name="rpIdForUAT"
                                                width="30ch"
                                                value={rpIdForUAT}
                                                onChange={({ value }) => {
                                                    onRpIdUATChanged(value);
                                                }}
                                            ></GoabInput>
                                        </InputComponent>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className={styles['service-available-container']}>
                        <div className={styles['section-header']}>
                            <div className={styles['service-available-label']}>Service details</div>
                        </div>
                        <div className={styles['service-available-desc']}>
                            Service details are sourced from existing PIBs and validated with the program area before
                            publishing on the Privacy Portal
                        </div>

                        <GoabSpacer vSpacing={'s'}></GoabSpacer>
                        <div className={styles['req-question-header']}>
                            Are the service details available right now?
                        </div>
                        <InputComponent error={availableError}>
                            <GoabRadioGroup
                                name="availability"
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
                        </InputComponent>
                    </div>
                </>
            )}
            <GoabSpacer vSpacing="s"></GoabSpacer>
            <div className={styles['bottom-div']}>
                <GoabButtonGroup alignment="start" mt="2xl">
                    <GoabButton
                        type="secondary"
                        leadingIcon="arrow-back"
                        onClick={() => {
                            if (canEdit) {
                                setOpenLeaveDialog(true);
                            } else {
                                navigateToServices();
                            }
                        }}
                        testId="service-back-button"
                    >
                        Back to digital services
                    </GoabButton>
                    {canEdit && (
                        <GoabButton type="submit" onClick={handleSubmit}>
                            Save and continue
                        </GoabButton>
                    )}
                </GoabButtonGroup>
            </div>
            <GoabModal
                heading={
                    <div className={styles['modal-header']}>
                        <div className={styles['header-icon-yellow-circle']}>
                            <GoabIcon type="alert-circle" theme="outline" opacity={1}></GoabIcon>
                        </div>
                        <div className={styles['header-text']}>Are you sure you want to go back?</div>
                    </div>
                }
                open={openLeaveDialog}
                role="alertdialog"
                actions={
                    <GoabButtonGroup alignment="end">
                        <GoabButton
                            type="secondary"
                            variant="normal"
                            onClick={() => {
                                setOpenLeaveDialog(false);
                                navigateToServices();
                            }}
                        >
                            Go Back
                        </GoabButton>
                        <GoabButton
                            type="primary"
                            variant="normal"
                            onClick={() => {
                                setOpenLeaveDialog(false);
                            }}
                        >
                            Cancel
                        </GoabButton>
                    </GoabButtonGroup>
                }
            >
                <div>
                    If you go back, any changes made on this page will be lost. To save your changes, click "Cancel" and
                    then select "Save and continue".
                </div>
            </GoabModal>
        </>
    );
};

export default AddService;
