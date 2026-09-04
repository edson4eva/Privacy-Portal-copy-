import { useState } from 'react';
import { GoabButton, GoabButtonGroup, GoabCircularProgress, GoabInput } from '@abgov/react-components';
import styles from './Section.module.scss';
import { Editor } from '@tinymce/tinymce-react';
import RichTextEditor from './RichTextEditor';
import { SectionYupSchema } from './EditSection';
import { ServiceSectionDto } from '../../types/ServiceSectionDto';
import * as Yup from 'yup';
import { InputComponent } from './InputComponent';

interface AddSectionProperties {
    serviceId: string;
    cancel: () => void;
    handler: (title: string, content: string) => Promise<void>;
}
const AddNewSection: React.FC<AddSectionProperties> = ({ serviceId, cancel, handler }): React.ReactElement => {
    const [title, setTitle] = useState<string>('New Section');
    const [content, setContent] = useState<string>('Add content for the new section here.');
    const [busy, setBusy] = useState<boolean>(false);
    const [titleError, setTitleError] = useState<string | undefined>();
    const [contentError, setContentError] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string>();

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

    const cancelAdd = () => {
        cancel();
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
                await handler(title, content);
            } catch (error) {
                setErrorMessage('error:' + error);
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
        <div className={styles['edit-container']}>
            <div className={styles['section-header']}>
                <div className={styles['section-header-text']}>Accordion</div>
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
                    <div className={styles['req-question-header']}>Description</div>
                    <InputComponent error={contentError}>
                        <RichTextEditor content={content} onContentChange={onChangeContent} height={500} />
                    </InputComponent>
                    <GoabButtonGroup alignment="start" mt="l">
                        <GoabButton onClick={cancelAdd} type="secondary">
                            Cancel
                        </GoabButton>
                        <GoabButton onClick={update} type="primary">
                            Save
                        </GoabButton>
                    </GoabButtonGroup>
                </div>
            )}
        </div>
    );
};

export default AddNewSection;
