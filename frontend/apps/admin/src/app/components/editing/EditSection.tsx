import { useState } from 'react';
import {
    GoabButton,
    GoabButtonGroup,
    GoabCircularProgress,
    GoabInput,
    GoabModal,
    GoabSpacer,
} from '@abgov/react-components';
import styles from './Section.module.scss';
import '../../pages/tinymce.css';
import { put } from 'shared/src/lib/api';
import RichTextEditor from './RichTextEditor';
import { ServiceDetailSection } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';
import { ServiceSectionDto } from '../../types/ServiceSectionDto';
import { InputComponent } from './InputComponent';
import * as Yup from 'yup';
import { useEditLockContext } from '../../context/EditLockContext';
import { ErrorMessage } from '../error/ErrorMessage';

interface EditSectionProperties {
    section: ServiceDetailSection;
    index: number;
    serviceId: string;
    deleteHandler: (index: number) => Promise<boolean>;
}

export const SectionYupSchema = Yup.object({
    title: Yup.string().required('Accordion title is required'),
    content: Yup.string().required('Description is required'),
});

const EditSection: React.FC<EditSectionProperties> = ({
    section,
    index,
    serviceId,
    deleteHandler,
}): React.ReactElement => {
    const { editLock, setEditLock, sectionStatus, setSectionStatus, saveMessage, showSaveMessage } =
        useEditLockContext();

    const [isEditing, setIsEditing] = useState<boolean>(sectionStatus[index].isEditing);
    const [title, setTitle] = useState<string>(section.title);
    const [content, setContent] = useState<string>(section.content);
    const [busy, setBusy] = useState<boolean>(false);
    const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
    const [titleError, setTitleError] = useState<string | undefined>();
    const [contentError, setContentError] = useState<string | undefined>();

    const validateData = async (formValues: ServiceSectionDto): Promise<boolean | Yup.ValidationError[]> => {
        try {
            await SectionYupSchema.validate(formValues, { abortEarly: false });
            return true;
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return error.inner;
            }
            return [];
        }
    };

    const processValidationResult = (errors: Yup.ValidationError[]) => {
        let currentError = errors.find((x) => x.path === 'title');
        setTitleError(currentError ? currentError.message : undefined);
        currentError = errors.find((x) => x.path === 'content');
        setContentError(currentError ? currentError.message : undefined);
    };

    const updateEditStatus = (value: boolean) => {
        setIsEditing(value);
        sectionStatus[index].isEditing = value;
        setSectionStatus([...sectionStatus]);
    };
    const startEdit = () => {
        updateEditStatus(true);
    };
    const cancelEdit = () => {
        updateEditStatus(false);
        setTitle(section.title);
        setContent(section.content);
    };

    const deleteSection = async () => {
        setOpenConfirmModal(false);
        setBusy(true);
        await deleteHandler(index);
        setBusy(false);
    };
    const update = async () => {
        setBusy(true);
        const data = {
            title: title,
            content: content,
        };

        const validationResult = await validateData(data);
        if (validationResult === true) {
            try {
                const response = await put<ServiceSectionDto, ServiceSectionDto>(
                    `/v1/services/${serviceId}/sections/${index}`,
                    data,
                    { redirectOnError: false }
                );
                setTitle(response.title);
                setContent(response.content);
                section.title = response.title;
                section.content = response.content;
                updateEditStatus(false);
            } catch (error) {
                alert(error);
            }
        } else {
            if (Array.isArray(validationResult)) {
                processValidationResult(validationResult);
            } else {
                alert('Unknown validation error!');
            }
        }
        setBusy(false);
    };
    const onChangeTitle = (newValue: string) => {
        setTitle(newValue);
    };
    const onChangeContent = (newValue: string) => {
        setContent(newValue);
    };

    return (
        <div key={index}>
            <div className={styles['edit-container']}>
                <div className={styles['section-header']}>
                    <div className={styles['section-header-text']}>Accordion</div>
                    {editLock.canEdit && (
                        <div className={styles['section-header-btn']}>
                            {!isEditing && (
                                <GoabButton
                                    onClick={startEdit}
                                    leadingIcon="pencil"
                                    type="tertiary"
                                    size="compact"
                                ></GoabButton>
                            )}

                            <GoabButton
                                leadingIcon="trash-bin"
                                type="tertiary"
                                size="compact"
                                onClick={() => {
                                    setOpenConfirmModal(true);
                                }}
                            ></GoabButton>
                        </div>
                    )}
                </div>
                {busy ? (
                    <GoabCircularProgress
                        variant="inline"
                        size="small"
                        message="Saving..."
                        visible={busy}
                    ></GoabCircularProgress>
                ) : (
                    <div>
                        {isEditing && editLock.canEdit ? (
                            <div>
                                <div className={styles['req-question-header']}>Accordion Title</div>
                                <InputComponent error={titleError}>
                                    <GoabInput
                                        name="service_title"
                                        type="text"
                                        value={title}
                                        width="60ch"
                                        onChange={({ value }) => {
                                            onChangeTitle(value);
                                        }}
                                    ></GoabInput>
                                </InputComponent>
                                <GoabSpacer vSpacing={'s'}></GoabSpacer>
                                <div className={styles['req-question-header']}>Description</div>
                                <InputComponent error={contentError}>
                                    <RichTextEditor content={content} onContentChange={onChangeContent} height={500} />
                                </InputComponent>
                                <GoabButtonGroup alignment="start" mt="l">
                                    <GoabButton onClick={cancelEdit} type="secondary">
                                        Cancel
                                    </GoabButton>
                                    <GoabButton onClick={update} type="primary">
                                        Save
                                    </GoabButton>
                                </GoabButtonGroup>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    <b>{title}</b>
                                </p>
                                <div
                                    className={styles['raw-section-content']}
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
            {isEditing && showSaveMessage && <ErrorMessage error={saveMessage} />}
            <GoabSpacer vSpacing={'s'}></GoabSpacer>
            <GoabModal
                heading="Are you sure you want to delete this section?"
                open={openConfirmModal}
                role="alertdialog"
                onClose={() => setOpenConfirmModal(false)}
                actions={
                    <GoabButtonGroup alignment="end">
                        <GoabButton type="tertiary" onClick={() => setOpenConfirmModal(false)}>
                            Cancel
                        </GoabButton>
                        <GoabButton type="primary" variant="destructive" onClick={deleteSection}>
                            Delete Section
                        </GoabButton>
                    </GoabButtonGroup>
                }
            >
                <p>This action cannot be undone.</p>
            </GoabModal>
        </div>
    );
};

export default EditSection;
