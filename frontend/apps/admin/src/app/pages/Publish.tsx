import {
    GoabButton,
    GoabButtonGroup,
    GoabCircularProgress,
    GoabIcon,
    GoabModal,
    GoabSpacer,
    GoabTable,
} from '@abgov/react-components';
import styles from './Publish.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { useEffect, useState } from 'react';
import { get, post, put } from 'shared/src/lib/api/dataService';
import RichTextEditor from '../components/editing/RichTextEditor';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, formatDateString } from '../utils/dateUtils';
import { PublishStatus, PublishWorkflowStatus } from '../types/PublishStatus';
import { ErrorDialog } from '../components/error/ErrorDialog';
import { extractAxiosError } from '../utils/apiUtils';

const delayMS = 500;

const Publish = (): React.ReactElement => {
    const statuses = [
        { id: PublishStatus.NotStarted, label: 'Not Started' },
        { id: PublishStatus.InDevelopment, label: 'Review In Dev' },
        { id: PublishStatus.InUAT, label: 'Review In UAT' },
        { id: PublishStatus.InProduction, label: 'Review In Production' },
        { id: PublishStatus.Completed, label: 'Completed' },
    ];
    const [notes, setNotes] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(true);
    const [status, setStatus] = useState<number>(PublishStatus.NotStarted);
    const [busy, setBusy] = useState<boolean>(false);
    const [busyMessage, setBusyMessage] = useState<string>('please wait......');
    const [notesError, setNotesError] = useState<string | undefined>();
    const [developmentTimestamp, setDevelopmentTimestamp] = useState<string | undefined>();
    const [uatTimestamp, setUatTimestamp] = useState<string | undefined>();
    const [productionTimestamp, setProductionTimestamp] = useState<string | undefined>();
    const [currentNotes, setCurrentNotes] = useState<string>('');
    const [previewedInDevelopment, setPreviewedInDevelopment] = useState<boolean>(false);
    const [previewedInUAT, setPreviewedInUAT] = useState<boolean>(false);
    const [previewedInProduction, setPreviewedInProduction] = useState<boolean>(false);
    const [openRollbackDialog, setOpenRollbackDialog] = useState<boolean>(false);
    const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [noPublish, setNoPublish] = useState<boolean>(false);
    const navigate = useNavigate();

    const loadData = (data: PublishWorkflowStatus) => {
        setNotes(data.description ?? '');
        setCurrentNotes(data.description ?? '');
        setStatus(data.status);
        setDevelopmentTimestamp(formatDateString(data.confirmedInDevAt));
        setUatTimestamp(formatDateString(data.confirmedInUATAt));
        setProductionTimestamp(formatDateString(data.completedAt));
        setPreviewedInDevelopment(data.previewedInDev === true);
        setPreviewedInUAT(data.previewedInUAT === true);
        setPreviewedInProduction(data.previewedInProd === true);
        if (data.status === PublishStatus.NotStarted) {
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
        setNoPublish(data.isPublishDisabled === true);
    };
    useEffect(() => {
        async function fetchData() {
            const response = await get<PublishWorkflowStatus>('/v1/admin/publish-status', { redirectOnError: false });
            loadData(response);
        }
        fetchData();
    }, []);

    const openPreviewDevelopmentLink = async () => {
        if (status === PublishStatus.InDevelopment) {
            const result = await post<{ status: PublishWorkflowStatus }, { env: string }>(
                '/v1/admin/set-previewed',
                {
                    env: 'dev',
                },
                { redirectOnError: false }
            );
            loadData(result.status);
        }
        window.open(process.env.NX_PUBLIC_PREVIEW_DEV_URL, '_blank', 'noopener,noreferrer');
    };
    const openPreviewUATLink = async () => {
        if (status === PublishStatus.InUAT) {
            const result = await post<{ status: PublishWorkflowStatus }, { env: string }>(
                '/v1/admin/set-previewed',
                {
                    env: 'uat',
                },
                { redirectOnError: false }
            );
            loadData(result.status);
        }
        window.open(process.env.NX_PUBLIC_PREVIEW_UAT_URL, '_blank', 'noopener,noreferrer');
    };
    const openPreviewProductionLink = async () => {
        if (status === PublishStatus.InProduction) {
            const result = await post<{ status: PublishWorkflowStatus }, { env: string }>(
                '/v1/admin/set-previewed',
                {
                    env: 'prod',
                },
                { redirectOnError: false }
            );
            loadData(result.status);
        }
        window.open(process.env.NX_PUBLIC_PREVIEW_PROD_URL, '_blank', 'noopener,noreferrer');
    };
    const timeoutFunction = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };
    const handleNoteChanges = (value: string) => {
        setNotes(value);
    };
    const cancelSaveNotes = () => {
        setNotes(currentNotes);
        setIsEditing(false);
    };
    const showError = (error: string | undefined) => {
        setErrorMessage(error ?? 'Internel Server Error');
        setOpenErrorDialog(true);
    };
    const startWorkFlow = async () => {
        if (!notes) {
            setNotesError('Description is required');
            return;
        } else {
            setNotesError(undefined);
        }
        setCurrentNotes(notes);
        setBusy(true);

        try {
            const result = await post<{ status: PublishWorkflowStatus }, { description: string }>(
                '/v1/admin/start-publish',
                {
                    description: notes,
                },
                { redirectOnError: false }
            );
            loadData(result.status);
        } catch (error) {
            showError(extractAxiosError(error));
        }

        setIsEditing(false);
        setBusy(false);
    };
    const handleSaveNotes = async () => {
        if (!notes) {
            setNotesError('Description required');
            return;
        } else {
            setNotesError(undefined);
        }
        setCurrentNotes(notes);
        setBusy(true);

        try {
            const result = await post<{ status: PublishWorkflowStatus }, { description: string }>(
                '/v1/admin/update-publish-desc',
                {
                    description: notes,
                },
                { redirectOnError: false }
            );
            loadData(result.status);
        } catch (error) {
            showError(extractAxiosError(error));
        }

        setIsEditing(false);
        setBusy(false);
    };
    const publishInDevelopment = async () => {
        setBusy(true);
        try {
            const result = await post<{ status: PublishWorkflowStatus }, { env: string }>(
                '/v1/admin/publish',
                {
                    env: 'dev',
                },
                { redirectOnError: false, timeout: 30000 }
            );
            loadData(result.status);
        } catch (error) {
            showError(extractAxiosError(error));
        }
        setBusy(false);
    };
    const publishInUat = async () => {
        setBusy(true);
        try {
            const result = await post<{ status: PublishWorkflowStatus }, { env: string }>(
                '/v1/admin/publish',
                {
                    env: 'uat',
                },
                { redirectOnError: false }
            );
            loadData(result.status);
        } catch (error) {
            showError(extractAxiosError(error));
        }
        setBusy(false);
    };
    const publishInProduction = async () => {
        setBusy(true);
        try {
            const result = await post<{ status: PublishWorkflowStatus }, { env: string }>(
                '/v1/admin/publish',
                {
                    env: 'prod',
                },
                { redirectOnError: false }
            );
            loadData(result.status);
        } catch (error) {
            showError(extractAxiosError(error));
        }
        setBusy(false);
    };
    const rollback = async () => {
        setBusy(true);
        try {
            const result = await post<{ status: PublishWorkflowStatus }, any>(
                '/v1/admin/rollback',
                {},
                { redirectOnError: false }
            );
            loadData(result.status);
        } catch (error) {
            showError(extractAxiosError(error));
        }
        setBusy(false);
    };

    return (
        <div className={styles['container']}>
            <PageTitle title="PRIVACY PORTAL" fontColor="#004A8F" />
            {noPublish && (
                <>
                    <div className={styles['banner']}>
                        <div className={styles['banner-heading']}>Publish feature is disabled.</div>
                        <div className={styles['banner-message']}>
                            Publish feature is not configured for the current environment. Publish feature is only
                            available for Admin Portal in the production environment.
                        </div>
                    </div>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                </>
            )}
            <div className={styles['heading']}>Publish Content</div>
            <div className={styles['heading-desc']}>
                Review and describe your changes, preview them in each environment, and publish when ready. You can
                deploy to DEV, UAT or PROD based on your workflow.
            </div>
            <GoabSpacer vSpacing={'s'}></GoabSpacer>
            <div className={styles['heading-desc']}>
                Once published to PROD, you can continue making updates. If you've already published to DEV or UAT and
                need to make further changes, click Rollback to unlock the admin panel.
            </div>
            <GoabSpacer vSpacing={'xl'}></GoabSpacer>
            <ErrorDialog
                heading="Unexpected Error"
                error={errorMessage}
                open={openErrorDialog}
                setOpen={setOpenErrorDialog}
            />
            {busy && (
                <GoabCircularProgress
                    variant="fullscreen"
                    size="large"
                    message={busyMessage}
                    visible={true}
                ></GoabCircularProgress>
            )}
            <div className={styles['note-block']}>
                {!isEditing ? (
                    <div className={styles['section-header']}>
                        <div className={styles['section-header-text']}>Description of changes made</div>
                        {status !== PublishStatus.Completed && (
                            <div className={styles['section-header-btn']}>
                                <GoabButton
                                    onClick={() => {
                                        setIsEditing(true);
                                    }}
                                    leadingIcon="pencil"
                                    type="tertiary"
                                    size="compact"
                                    disabled={isEditing}
                                >
                                    Edit
                                </GoabButton>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles['note-heading']}>Description of changes made</div>
                )}
                <GoabSpacer vSpacing={'m'}></GoabSpacer>
                <div className={styles['heading-desc']}>
                    Before publishing, please enter a brief description of your changes. This helps maintain a clear
                    update history and keeps track of what changes are being published.
                </div>
                <GoabSpacer vSpacing={'m'}></GoabSpacer>
                <div className={notesError ? styles['red-border'] : styles['no-border']}>
                    <div className={isEditing ? styles['editor-heading'] : styles['editor-header-no-asterisk']}>
                        Describe changes
                    </div>
                    {isEditing ? (
                        <>
                            {notesError && <div className={styles['error']}>{notesError}</div>}
                            <RichTextEditor
                                content={notes}
                                height={300}
                                onContentChange={handleNoteChanges}
                            ></RichTextEditor>
                            <GoabSpacer vSpacing={'s'}></GoabSpacer>
                            {status === PublishStatus.NotStarted ? (
                                <GoabButton type="primary" variant="normal" onClick={startWorkFlow}>
                                    Start
                                </GoabButton>
                            ) : (
                                <GoabButtonGroup alignment="start" mt="l">
                                    <GoabButton onClick={cancelSaveNotes} type="secondary">
                                        Cancel
                                    </GoabButton>
                                    <GoabButton type="primary" onClick={handleSaveNotes}>
                                        Update
                                    </GoabButton>
                                </GoabButtonGroup>
                            )}
                        </>
                    ) : (
                        <div className={styles['raw-section-content']} dangerouslySetInnerHTML={{ __html: notes }} />
                    )}
                </div>
            </div>
            <GoabSpacer vSpacing={'s'}></GoabSpacer>
            <div className={styles['environment-block']}>
                <GoabTable width="100%">
                    <thead className={styles['tbl-thead']}>
                        <tr>
                            <th>Environment</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                            <th>Preview</th>
                            <th>Publish</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className={styles['env-label']}>Dev</div>
                            </td>
                            <td>
                                {status === PublishStatus.NotStarted ? (
                                    <div className={styles['red-dot']}>Not Started</div>
                                ) : status === PublishStatus.InDevelopment ? (
                                    <div className={styles['yellow-dot']}>Pending review</div>
                                ) : (
                                    <div className={styles['green-dot']}>Published</div>
                                )}
                            </td>
                            <td>{developmentTimestamp ? developmentTimestamp : '-'}</td>
                            <td>
                                {status === PublishStatus.InDevelopment ? (
                                    <button className={styles['link-btn']} onClick={openPreviewDevelopmentLink}>
                                        Preview in Dev
                                    </button>
                                ) : (
                                    <div className={styles['disabledLink']}>Preview in Dev</div>
                                )}
                            </td>
                            <td>
                                {status < PublishStatus.InUAT && (
                                    <GoabButton
                                        type="primary"
                                        variant="normal"
                                        disabled={status < PublishStatus.InDevelopment || !previewedInDevelopment}
                                        onClick={publishInDevelopment}
                                    >
                                        Publish in Dev
                                    </GoabButton>
                                )}
                                {status > PublishStatus.InDevelopment && (
                                    <div className={styles['header-icon-green-circle']}>
                                        <GoabIcon
                                            type="checkmark-circle"
                                            theme="outline"
                                            opacity={1}
                                            fillColor="white"
                                        ></GoabIcon>
                                    </div>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className={styles['env-label']}>UAT</div>
                            </td>
                            <td>
                                {status < PublishStatus.InUAT ? (
                                    <div className={styles['red-dot']}>Not Started</div>
                                ) : status === PublishStatus.InUAT ? (
                                    <div className={styles['yellow-dot']}>Pending review</div>
                                ) : (
                                    <div className={styles['green-dot']}>Published</div>
                                )}
                            </td>
                            <td>{uatTimestamp ? uatTimestamp : '-'}</td>
                            <td>
                                {status === PublishStatus.InUAT ? (
                                    <button className={styles['link-btn']} onClick={openPreviewUATLink}>
                                        Preview in UAT
                                    </button>
                                ) : (
                                    <div className={styles['disabledLink']}>Preview in UAT</div>
                                )}
                            </td>
                            <td>
                                {status < PublishStatus.InProduction && (
                                    <GoabButton
                                        type="primary"
                                        variant="normal"
                                        disabled={status < PublishStatus.InUAT || !previewedInUAT}
                                        onClick={publishInUat}
                                    >
                                        Publish in UAT
                                    </GoabButton>
                                )}
                                {status > PublishStatus.InUAT && (
                                    <div className={styles['header-icon-green-circle']}>
                                        <GoabIcon
                                            type="checkmark-circle"
                                            theme="outline"
                                            opacity={1}
                                            fillColor="white"
                                        ></GoabIcon>
                                    </div>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className={styles['env-label']}>Prod</div>
                            </td>
                            <td>
                                {status < PublishStatus.InProduction ? (
                                    <div className={styles['red-dot']}>Not Started</div>
                                ) : status === PublishStatus.InProduction ? (
                                    <div className={styles['yellow-dot']}>Pending review</div>
                                ) : (
                                    <div className={styles['green-dot']}>Published</div>
                                )}
                            </td>
                            <td>{productionTimestamp ? productionTimestamp : '-'}</td>
                            <td>
                                {status === PublishStatus.InProduction ? (
                                    <button className={styles['link-btn']} onClick={openPreviewProductionLink}>
                                        Preview in Prod
                                    </button>
                                ) : (
                                    <div className={styles['disabledLink']}>Preview in Prod</div>
                                )}
                            </td>
                            <td>
                                {status < PublishStatus.Completed && (
                                    <GoabButton
                                        type="primary"
                                        variant="normal"
                                        disabled={status < PublishStatus.InProduction || !previewedInProduction}
                                        onClick={publishInProduction}
                                    >
                                        Publish in Prod
                                    </GoabButton>
                                )}
                                {status === PublishStatus.Completed && (
                                    <div className={styles['header-icon-green-circle']}>
                                        <GoabIcon
                                            type="checkmark-circle"
                                            theme="outline"
                                            opacity={1}
                                            fillColor="white"
                                        ></GoabIcon>
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </GoabTable>
            </div>
            <GoabModal
                heading={
                    <div className={styles['modal-header']}>
                        <div className={styles['header-icon-yellow-circle']}>
                            <GoabIcon type="alert-circle" theme="outline" opacity={1}></GoabIcon>
                        </div>
                        <div className={styles['header-text']}>Rollback changes</div>
                    </div>
                }
                open={openRollbackDialog}
                role="alertdialog"
                actions={
                    <GoabButtonGroup alignment="end">
                        <GoabButton
                            type="secondary"
                            variant="normal"
                            onClick={() => {
                                setOpenRollbackDialog(false);
                            }}
                        >
                            Cancel
                        </GoabButton>
                        <GoabButton
                            type="primary"
                            variant="normal"
                            onClick={() => {
                                setOpenRollbackDialog(false);
                                rollback();
                            }}
                        >
                            Rollback
                        </GoabButton>
                    </GoabButtonGroup>
                }
            >
                <div>Are you sure you want to rollback the changes you published to DEV or UAT?</div>
            </GoabModal>
            <GoabSpacer vSpacing={'xl'}></GoabSpacer>
            {status === PublishStatus.Completed ? (
                <>
                    <div className={styles['completed-block']}>
                        <div className={styles['completed-header']}>
                            <div className={styles['header-icon']}>
                                <GoabIcon type="checkmark-circle" size="large" theme="outline" fillColor="#006f4c" />
                            </div>
                            <div className={styles['header-text']}>Content has been published successfully</div>
                        </div>

                        <div className={styles['heading-desc']}>
                            Your changes have been successfully published to the Production environment. To restart the
                            publishing workflow, make additional changes first -- this will automatically enable the
                            option to publish.
                        </div>
                    </div>
                    <div className={styles['bottom-block']}>
                        <GoabButton
                            type="primary"
                            variant="normal"
                            onClick={() => {
                                navigate('/services');
                            }}
                        >
                            Go to content
                        </GoabButton>
                    </div>
                </>
            ) : (
                <div className={styles['rollback-block']}>
                    <div className={styles['rollback-header']}>Rolling back changes from DEV or UAT</div>
                    <div className={styles['heading-desc']}>
                        If you need to make further edits after publishing to DEV or UAT (but before PROD), you can
                        rollback back your changes, make updates, and republish when ready.
                    </div>
                    <GoabSpacer vSpacing={'s'}></GoabSpacer>
                    <GoabButton
                        type="primary"
                        variant="normal"
                        disabled={status === PublishStatus.NotStarted || status === PublishStatus.Completed}
                        onClick={() => {
                            setOpenRollbackDialog(true);
                        }}
                    >
                        Rollback changes
                    </GoabButton>
                </div>
            )}
        </div>
    );
};

export default Publish;
