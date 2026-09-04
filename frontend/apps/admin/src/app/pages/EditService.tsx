import { useEffect, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { get, post, put, remove } from 'shared/src/lib/api/dataService';
import {
    ServiceDetailModel,
    ServiceDetailSection,
} from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';
import { ServiceSectionDto } from '../types/ServiceSectionDto';
import styles from './EditService.module.scss';
import {
    GoabButton,
    GoabButtonGroup,
    GoabIcon,
    GoabModal,
    GoabSpacer,
    GoabTab,
    GoabTabs,
} from '@abgov/react-components';
import ServiceSections from '../components/editing/ServiceSections';
import AddNewSection from '../components/editing/AddNewSection';
import EditServiceMainInfo from '../components/editing/EditServiceMainInfo';
import EditServiceInternal from '../components/editing/EditServiceInternal';
import HistorySection from '../components/editing/HistorySection';
import EditServiceDetailsAvailibility from '../components/editing/EditServiceDetailsAvailibility';
import { timeoutFunction } from '../utils/apiUtils';
import { SectionEditStatus, useEditLockContext } from '../context/EditLockContext';
import { PublishStatus, PublishWorkflowStatus } from '../types/PublishStatus';
import EditLockCallout from '../components/callout/EditLockCallout';
import BackButton from 'shared/src/lib/accessed-service-details/back-button/BackButton';
import { ErrorMessage } from '../components/error/ErrorMessage';
import { WarnDialog } from '../components/warn-dialog/WarnDialog';

const EditService = (): React.ReactElement => {
    const { serviceId } = useParams();
    const [details, setDetails] = useState<ServiceDetailModel>();
    const [sections, setSections] = useState<ServiceDetailSection[]>([]);
    const [activeTab, setActiveTab] = useState<number>(2);
    const [showAddButton, setShowAddButton] = useState<boolean>(true);
    const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
    const [openLeaveDialog, setOpenLeaveDialog] = useState<boolean>(false);
    const {
        editLock,
        setEditLock,
        isEditingMainInfo,
        setIsEditingInternalInfo,
        isEditingInternalInfo,
        setIsEditingMainInfo,
        sectionStatus,
        setSectionStatus,
        saveMessage,
        setSaveMessage,
        setShowSaveMessage,
        showSaveMessage,
    } = useEditLockContext();

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
        return checkIsEditing();
    });
    useEffect(() => {
        async function fetchData() {
            const response = await get<PublishWorkflowStatus>('/v1/admin/publish-status', { redirectOnError: false });
            setEditLock({
                canEdit: response.status === PublishStatus.NotStarted || response.status === PublishStatus.Completed,
                status: response.status,
            });
        }
        fetchData();
    }, []);
    useEffect(() => {
        async function fetchData() {
            setShowSaveMessage(false);
            setIsEditingInternalInfo(false);
            setIsEditingMainInfo(false);
            const response = await get<{ serviceDetails: ServiceDetailModel }>(`/v1/services/${serviceId}`, {
                redirectOnError: false,
            });
            setDetails(response.serviceDetails);

            if (response.serviceDetails.sections) {
                const statuses: SectionEditStatus[] = response.serviceDetails.sections.map((item, index) => {
                    return {
                        index: index,
                        isEditing: false,
                    };
                });
                setSectionStatus(statuses);
                setSections(response.serviceDetails.sections);
                setActiveTab(response.serviceDetails.isAvailable === true ? 1 : 2);
            }
        }
        fetchData();
    }, [serviceId]);
    useEffect(() => {
        async function gotoTop() {
            await timeoutFunction(100);
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
        gotoTop();
    }, [sections]);

    const navigate = useNavigate();
    const gotoPublish = () => {
        navigate('/publish');
    };

    const checkIsEditing = (): boolean => {
        return editLock.canEdit
            ? isEditingInternalInfo ||
                  isEditingMainInfo ||
                  !showAddButton ||
                  (activeTab === 1 && sectionStatus.findIndex((x) => x.isEditing) !== -1)
            : false;
    };
    const handleBack = () => {
        if (editLock.canEdit) {
            setOpenLeaveDialog(true);
        } else {
            navigate('/services');
        }
    };
    const handleBackNoPrompt = () => {
        navigate('/services');
    };
    const handleConfirm = () => {
        if (checkIsEditing()) {
            setSaveMessage('Save changes to confirm service details.');
            setShowSaveMessage(true);
        } else {
            setShowSaveMessage(false);
            setOpenSaveDialog(true);
        }
    };
    const handlePreview = () => {
        if (checkIsEditing()) {
            setSaveMessage('Save changes to preview.');
            setShowSaveMessage(true);
        } else {
            navigate(`/preview-service/${serviceId}`);
        }
    };

    const cancelAdd = () => {
        setShowAddButton(true);
    };
    const handleAddSection = async (title: string, content: string): Promise<void> => {
        const response = await post<ServiceSectionDto, any>(
            `/v1/services/${serviceId}/sections`,
            {
                title: title,
                content: content,
            },
            {
                redirectOnError: false,
            }
        );
        const newSections = [
            ...sections,
            {
                title: title,
                content: content,
            },
        ];
        const newStasuses = [...sectionStatus, { index: newSections.length - 1, isEditing: true }];
        setSectionStatus(newStasuses);
        setSections(newSections);
        setShowAddButton(true);
        return Promise.resolve();
    };

    const removeSection = async (index: number): Promise<boolean> => {
        const response = await remove<ServiceDetailModel>(`/v1/services/${serviceId}/sections/${index}`, {
            redirectOnError: false,
        });
        if (response.sections) {
            const newStasuses = sectionStatus.filter((x) => x.index !== index);
            setSectionStatus(newStasuses);
            setSections(response.sections);
        }
        return true;
    };

    return (
        <div className={styles['container']}>
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
            <div className={styles['content-container']}>
                <BackButton buttonText="Back to digital services" onClick={handleBack} />
                {!editLock.canEdit && <EditLockCallout />}
            </div>
            {details && (
                <div className={styles['content-container']}>
                    <EditServiceMainInfo model={details}></EditServiceMainInfo>
                    {isEditingMainInfo && showSaveMessage && <ErrorMessage error={saveMessage} />}
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <EditServiceInternal model={details}></EditServiceInternal>
                    {isEditingInternalInfo && showSaveMessage && <ErrorMessage error={saveMessage} />}
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <HistorySection model={details}></HistorySection>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>

                    <EditServiceDetailsAvailibility
                        serviceId={serviceId ?? ''}
                        isAvailable={details.isAvailable}
                        valueChanged={(value) => {
                            setActiveTab(value ? 1 : 2);
                        }}
                    ></EditServiceDetailsAvailibility>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    {editLock.canEdit && (
                        <GoabTabs
                            initialTab={activeTab}
                            key={activeTab}
                            onChange={({ tab }) => {
                                setActiveTab(tab);
                            }}
                        >
                            <GoabTab heading="Service details available"></GoabTab>
                            <GoabTab heading="Service details not available"></GoabTab>
                        </GoabTabs>
                    )}
                    {(editLock.canEdit && activeTab === 1) || (!editLock.canEdit && details.isAvailable) ? (
                        <>
                            <ServiceSections
                                items={sections}
                                serviceId={serviceId ?? ''}
                                deleteHandler={removeSection}
                            />
                            <GoabSpacer vSpacing={'s'}></GoabSpacer>
                            {editLock.canEdit && (
                                <div>
                                    {showAddButton ? (
                                        <div className={styles['add-new-accordion']}>
                                            <button
                                                className={styles['add-button']}
                                                onClick={() => {
                                                    setShowAddButton(false);
                                                    setShowSaveMessage(false);
                                                }}
                                            >
                                                + Add new accordion
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <AddNewSection
                                                serviceId={serviceId ?? ''}
                                                handler={handleAddSection}
                                                cancel={cancelAdd}
                                            />
                                            {showSaveMessage && <ErrorMessage error={saveMessage} />}
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles['service-details-coming-soon-box']}>
                            <div className={styles['coming-soon-title']}>
                                <div className={styles['coming-soon-title-icon']}>
                                    <GoabIcon
                                        type="alert-circle"
                                        fillColor="#000"
                                        theme="outline"
                                        testId="service-details-coming-soon-alert-icon"
                                    ></GoabIcon>
                                </div>
                                <div className={styles['coming-soon-title-text']}>Service details coming soon</div>
                            </div>
                            <div className={styles['coming-soon-description']}>
                                We are working to provide more details about this service, including the personal
                                information maintained and how it is used. Stay tuned for updates.
                            </div>
                        </div>
                    )}
                    <GoabSpacer vSpacing={'m'}></GoabSpacer>
                    <div className={styles['button-container']} data-testid="button-container">
                        <GoabButton
                            type={editLock.canEdit ? 'secondary' : 'primary'}
                            variant="normal"
                            onClick={handlePreview}
                        >
                            Preview
                        </GoabButton>
                        {editLock.canEdit && (
                            <GoabButton
                                type="primary"
                                variant="normal"
                                onClick={() => {
                                    handleConfirm();
                                }}
                            >
                                Confirm service details
                            </GoabButton>
                        )}
                    </div>
                </div>
            )}
            <GoabModal
                heading={
                    <div className={styles['modal-header']}>
                        <div className={styles['header-icon-green-circle']}>
                            <GoabIcon type="checkmark-circle" theme="outline" opacity={1} fillColor="white"></GoabIcon>
                        </div>
                        <div className={styles['header-text']}>Service details confirmed</div>
                    </div>
                }
                open={openSaveDialog}
                role="alertdialog"
                onClose={() => setOpenSaveDialog(false)}
                actions={
                    <GoabButtonGroup alignment="end">
                        <GoabButton
                            type="secondary"
                            variant="normal"
                            leadingIcon="arrow-back"
                            onClick={() => {
                                setOpenSaveDialog(false);
                                handleBackNoPrompt();
                            }}
                        >
                            Back to content
                        </GoabButton>
                        <GoabButton
                            type="primary"
                            variant="normal"
                            onClick={() => {
                                setOpenSaveDialog(false);
                                gotoPublish();
                            }}
                        >
                            Go to publish
                        </GoabButton>
                    </GoabButtonGroup>
                }
            >
                <div>
                    Your service details have been confirmed. You can now return to the Content section to add or edit
                    another service or publish your changes within the admin panel.
                </div>
            </GoabModal>
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
                            leadingIcon="arrow-back"
                            onClick={() => {
                                setOpenLeaveDialog(false);
                                handleBackNoPrompt();
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
                    then select "Confirm service details".
                </div>
            </GoabModal>
            <div className={styles['content-container']}>
                <BackButton buttonText="Back to digital services" onClick={handleBack} />
            </div>
        </div>
    );
};

export default EditService;
