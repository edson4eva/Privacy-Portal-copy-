import { useState } from 'react';
import {
    GoabBadge,
    GoabBlock,
    GoabButton,
    GoabButtonGroup,
    GoabCircularProgress,
    GoabDropdown,
    GoabDropdownItem,
    GoabIcon,
    GoabInput,
    GoabSpacer,
} from '@abgov/react-components';
import styles from './Section.module.scss';
import RichTextEditor from './RichTextEditor';
import { put } from 'shared/src/lib/api/dataService';
//import { Categories, Ministries } from 'shared/src/lib/access-pages/service-details/types/ServiceConstants';
import ErrorBar from '../error/ErrorBar';
import axios, { AxiosError } from 'axios';
import { ServiceDetailModel } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';
import { ServiceDetailDto } from '../../types/ServiceDetailDto';
import { Categories } from 'shared/src/lib/accessed-service-details/types/Constants';
import { MinistryOptions } from '../../types/Constants';
import { InputComponent } from './InputComponent';
import { extractAxiosError, VALIDATION_ERRORS } from '../../utils/apiUtils';
import * as Yup from 'yup';
import { useEditLockContext } from '../../context/EditLockContext';
import { DropdownOption, MultiSelectDropdown } from './MultiSelectDropdown';

interface EditServiceMainInfoProperties {
    model: ServiceDetailModel;
}

const ServiceMainInfoSchema = Yup.object({
    serviceName: Yup.string().trim().required('Service name is required'),
    description: Yup.string().trim().required('Service description is required'),
    categoryId: Yup.string().required('Category is required'),
    dataOwnerIds: Yup.array().of(Yup.string()).min(1, 'Select ministry and data owner').max(5, 'Select a maximum of 5'),
    accessServiceUrl: Yup.string().trim().required('Service access link is required'),
});

const EditServiceMainInfo: React.FC<EditServiceMainInfoProperties> = ({ model }): React.ReactElement => {
    const [serviceName, setServiceName] = useState<string>(model.serviceName ?? '');
    const [description, setDescription] = useState<string>(model.description ?? '');
    const [categoryId, setCategoryId] = useState<string>(model.categoryId ?? '');
    const [categoryText, setCategoryText] = useState<string>(model.categoryText ?? '');
    const [serviceDto, setServiceDto] = useState<ServiceDetailDto | undefined>();

    const [selectedMinistryOptions, setSelectedMinistryOptions] = useState<DropdownOption[]>(
        MinistryOptions.filter((option) => model.dataOwnerIds?.includes(option.value))
    );
    const [url, setUrl] = useState<string>(model.accessServiceUrl ?? '');
    const [busy, setBusy] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const [serviceNameError, setServiceNameError] = useState<string | undefined>();
    const [descriptionError, setDescriptionError] = useState<string | undefined>();
    const [categoryError, setCategoryError] = useState<string | undefined>();
    const [dataOwnerError, setDataOwnerError] = useState<string | undefined>();
    const [urlError, setUrlError] = useState<string | undefined>();
    const { editLock, isEditingMainInfo, setIsEditingMainInfo, setShowSaveMessage } = useEditLockContext();

    const validateData = async (formValues: ServiceDetailDto): Promise<boolean | Yup.ValidationError[]> => {
        try {
            await ServiceMainInfoSchema.validate(formValues, { abortEarly: false });
            return true;
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return error.inner;
            }
            return [];
        }
    };

    const processValidationResult = (errors: Yup.ValidationError[]) => {
        let currentError = errors.find((x) => x.path === 'serviceName');
        setServiceNameError(currentError ? currentError.message : undefined);
        currentError = errors.find((x) => x.path === 'description');
        setDescriptionError(currentError ? currentError.message : undefined);
        currentError = errors.find((x) => x.path === 'categoryId');
        setCategoryError(currentError ? currentError.message : undefined);
        currentError = errors.find((x) => x.path === 'dataOwnerIds');
        setDataOwnerError(currentError ? currentError.message : undefined);
        currentError = errors.find((x) => x.path === 'accessServiceUrl');
        setUrlError(currentError ? currentError.message : undefined);
    };

    const startEdit = () => {
        setIsEditingMainInfo(true);
        setShowSaveMessage(false);
    };
    const cancel = () => {
        setIsEditingMainInfo(false);
        setErrorMessage(undefined);
        if (serviceDto) {
            setServiceName(serviceDto.serviceName ?? '');
            setDescription(serviceDto.description ?? '');
            setCategoryId(serviceDto.categoryId ?? '');
            setCategoryText(Categories.find((x) => x.id === serviceDto.categoryId)?.label ?? '');
            setSelectedMinistryOptions(
                MinistryOptions.filter((option) => serviceDto.dataOwnerIds?.includes(option.value))
            );
            setUrl(serviceDto.accessServiceUrl ?? '');
        } else {
            setServiceName(model.serviceName ?? '');
            setDescription(model.description ?? '');
            setCategoryId(model.categoryId ?? '');
            setCategoryText(model.categoryText ?? '');
            setSelectedMinistryOptions(MinistryOptions.filter((option) => model.dataOwnerIds?.includes(option.value)));
            setUrl(model.accessServiceUrl ?? '');
        }
        setServiceNameError(undefined);
        setDescriptionError(undefined);
        setCategoryError(undefined);
        setDataOwnerError(undefined);
        setUrlError(undefined);
    };

    const onChangeServiceName = (value: string) => {
        setServiceName(value);
    };
    const onChangeDesc = (value: string) => {
        setDescription(value);
    };
    const onChangeCategory = (value: string | string[]) => {
        if (typeof value === 'string') {
            setCategoryId(value);
            setCategoryText(Categories.find((x) => x.id === value)?.label ?? '');
        }
    };
    const onChangeUrl = (value: string) => {
        setUrl(value);
    };

    const checkServerErrors = (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const errorString = extractAxiosError(error);
            switch (errorString) {
                case VALIDATION_ERRORS.SERVICE_NAME_MISSING:
                case VALIDATION_ERRORS.SERVICE_NAME_TOO_LONG:
                case VALIDATION_ERRORS.SERVICE_NAME_CONFLICT:
                    setServiceNameError(errorString);
                    break;
                case VALIDATION_ERRORS.SERVICE_DESC_MISSING:
                case VALIDATION_ERRORS.SERVICE_DESC_TOO_LONG:
                    setDescriptionError(errorMessage);
                    break;
                case VALIDATION_ERRORS.CATEGORY_MISSING:
                case VALIDATION_ERRORS.INVALID_CATEGORY:
                    setCategoryError(errorMessage);
                    break;
                case VALIDATION_ERRORS.DATA_OWNER_MISSING:
                case VALIDATION_ERRORS.INVALID_DATAOWNER:
                    setDataOwnerError(errorMessage);
                    break;
                case VALIDATION_ERRORS.SERVICE_LINK_MISSING:
                case VALIDATION_ERRORS.INVALID_SERVICE_LINK:
                    setUrlError(errorMessage);
                    break;
                default:
                    setErrorMessage('Unexpected Service Error!');
            }
            setErrorMessage(errorString);
        } else {
            alert(error);
        }
    };
    const update = async () => {
        setBusy(true);
        setErrorMessage(undefined);
        try {
            const data: ServiceDetailDto = {
                serviceName: serviceName,
                categoryId: categoryId,
                dataOwnerIds: selectedMinistryOptions.map((option) => option.value),
                description: description,
                accessServiceUrl: url,
            };
            const validationResult = await validateData(data);
            if (validationResult === true) {
                setServiceNameError(undefined);
                setDescriptionError(undefined);
                setCategoryError(undefined);
                setDataOwnerError(undefined);
                setUrlError(undefined);
                const response = await put<ServiceDetailDto, ServiceDetailDto>(`/v1/services/${model.id}`, data, {
                    redirectOnError: false,
                });
                setServiceDto(response);
                setServiceName(response.serviceName ?? '');
                setDescription(response.description ?? '');
                setUrl(response.accessServiceUrl ?? '');
                setCategoryId(response.categoryId ?? '');
                setSelectedMinistryOptions(
                    MinistryOptions.filter((option) => response.dataOwnerIds?.includes(option.value))
                );
                setIsEditingMainInfo(false);
            } else {
                if (Array.isArray(validationResult)) {
                    processValidationResult(validationResult);
                } else {
                    setErrorMessage('Unknown validation error!');
                }
            }
        } catch (error) {
            checkServerErrors(error);
        }
        setBusy(false);
    };
    return (
        <div className={styles['edit-container']}>
            {errorMessage && <ErrorBar content={errorMessage}></ErrorBar>}
            {busy ? (
                <GoabCircularProgress
                    variant="inline"
                    size="small"
                    message="Saving..."
                    visible={busy}
                ></GoabCircularProgress>
            ) : isEditingMainInfo ? (
                <>
                    <div className={styles['section-header']}>
                        <div className={styles['section-header-name']}>Service details information</div>
                    </div>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <p>The following details will be shown at the Service details page.</p>
                    <div className={styles['req-question-header']}>Service name</div>
                    <InputComponent error={serviceNameError}>
                        <GoabInput
                            name="service_title"
                            type="text"
                            value={serviceName}
                            width="100%"
                            onChange={({ value }) => {
                                onChangeServiceName(value);
                            }}
                        ></GoabInput>
                    </InputComponent>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <div className={styles['req-question-header']}>Service description</div>
                    <InputComponent error={descriptionError}>
                        <RichTextEditor content={description} onContentChange={onChangeDesc} height={200} />
                    </InputComponent>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <div className={styles['sidebyside']}>
                        <div>
                            <div className={styles['req-question-header']}>Category</div>
                            <InputComponent error={categoryError}>
                                <GoabDropdown
                                    name="item"
                                    value={categoryId}
                                    width="100%"
                                    placeholder="Select"
                                    filterable={true}
                                    onChange={({ value }) => {
                                        onChangeCategory(value ?? '');
                                    }}
                                >
                                    {Categories.map((entry, index) => (
                                        <GoabDropdownItem
                                            value={entry.id}
                                            label={entry.label}
                                            key={index}
                                        ></GoabDropdownItem>
                                    ))}
                                </GoabDropdown>
                            </InputComponent>
                        </div>
                        <div>
                            <div className={styles['req-question-header']}>Ministry and data owner</div>
                            <InputComponent error={dataOwnerError}>
                                <MultiSelectDropdown
                                    label="Ministry and Data owner"
                                    options={MinistryOptions}
                                    selectedOptions={selectedMinistryOptions}
                                    onChange={setSelectedMinistryOptions}
                                />
                            </InputComponent>
                        </div>
                    </div>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <div className={styles['req-question-header']}>Service access link</div>
                    <InputComponent error={urlError}>
                        <GoabInput
                            name="service_url"
                            type="text"
                            value={url}
                            width="100%"
                            onChange={({ value }) => {
                                onChangeUrl(value);
                            }}
                        ></GoabInput>
                    </InputComponent>
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
                    <div className={styles['section-header']}>
                        <div className={styles['service-name']}>{serviceName}</div>
                        {editLock.canEdit && (
                            <div className={styles['section-header-btn']}>
                                <GoabButton
                                    onClick={startEdit}
                                    leadingIcon="pencil"
                                    type="tertiary"
                                    size="compact"
                                    disabled={isEditingMainInfo}
                                >
                                    Edit
                                </GoabButton>
                            </div>
                        )}
                    </div>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <div>
                        <div
                            className={styles['raw-section-content-no-link-icon']}
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>
                        <GoabBlock gap="s" direction="row" alignment="start">
                            <div>
                                <GoabIcon type="albums" opacity={1}></GoabIcon>
                            </div>
                            <div>
                                <div>
                                    <b>Category</b>
                                </div>
                                <div className={styles['badge']}>{categoryText}</div>
                            </div>
                        </GoabBlock>
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>
                        <GoabBlock gap="s" direction="row" alignment="start">
                            <div>
                                <GoabIcon type="business" opacity={1}></GoabIcon>
                            </div>
                            <div>
                                <div>
                                    <b>Ministry and data owner</b>
                                </div>

                                <div className={styles['data-owner-container']}>
                                    {selectedMinistryOptions.map((option) => (
                                        <div className={styles['data-owners']} key={option.value}>
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GoabBlock>
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>
                        <GoabBlock gap="s" direction="row" alignment="start">
                            <div>
                                <GoabIcon type="open" opacity={1}></GoabIcon>
                            </div>
                            <div>
                                <div>
                                    <b>Service link</b>
                                </div>
                                <a href={url} target="_blank">
                                    {url}
                                </a>
                            </div>
                        </GoabBlock>
                    </div>
                </>
            )}
        </div>
    );
};

export default EditServiceMainInfo;
