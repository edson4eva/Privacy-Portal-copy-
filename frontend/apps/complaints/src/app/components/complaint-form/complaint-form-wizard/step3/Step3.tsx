/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, Controller } from 'react-hook-form';
import style from './Step3.module.scss';
import {
    GoabButton,
    GoabFileUploadCard,
    GoabFileUploadInput,
    GoabFormItem,
    GoabTextarea,
} from '@abgov/react-components';
import { useEffect, useState, useRef } from 'react';
import { uploadFile } from 'shared/src/lib/api/azureBlobService';
import { getAcceptedMimes } from 'shared/src/lib/utils/helper';
import ErrorPage from 'shared/src/lib/error-page/ErrorPage';
import WarningIndicator from 'shared/src/lib/warning-indicator/WarningIndicator';
import MandatoryFieldLabel from 'shared/src/lib/mandatory-field-label/MandatoryFieldLabel';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';

interface Step3Property {
    control: Control<any>;
}
const Step3 = ({ control }: Step3Property): React.ReactElement => {
    const [uploads, setUploads] = useState<File[]>([]);
    const [progressList] = useState<Record<string, number>>({});
    const [showDocumentationArea, setShowDocumentationArea] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<boolean>(false);
    const windowWidth = useWindowWidth();
    const onFilesChangeReference = useRef<(files: any[]) => void>(() => {});
    const filesValueReference = useRef<any[]>([]);

    useEffect(() => {
        setShowDocumentationArea(uploads.length > 0);
    }, [uploads]);

    const upload = (detail: { file: File }) => {
        const file = detail.file;
        if (!file || !(file instanceof File) || uploads.length >= 5) {
            return;
        }

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async (event: ProgressEvent<FileReader>) => {
            if (!event.target) return;

            const response = await uploadFile(file);

            if (response.success) {
                const newFile = {
                    fileType: file.type,
                    fileName: file.name,
                    url: response.url,
                    fileSize: file.size,
                };

                const updatedFiles = [...filesValueReference.current, newFile];
                filesValueReference.current = updatedFiles;
                onFilesChangeReference.current?.(updatedFiles);
                setUploads((previous) => [...previous, file]);
            } else {
                setUploadError(true);
                console.error(response.message);
            }
        };
    };

    const deleteFile = (fileToDelete: File) => {
        if (!fileToDelete) return;

        const updatedFiles = filesValueReference.current.filter((f) => f.fileName !== fileToDelete.name);
        setUploads((previous) => previous.filter((f) => f.name !== fileToDelete.name));
        onFilesChangeReference.current?.(updatedFiles);
    };

    return (
        <div className={style['step3']}>
            {windowWidth < 624 && (
                <>
                    <PageTitle title="FILE A COMPLAINT" fontColor="var(--goa-color-info-default)" />
                    <PpSpacer vSpacing={'s'}></PpSpacer>
                    <PageSubTitle subTitle="Attach documentation" />
                    <PpSpacer vSpacing="s"></PpSpacer>
                </>
            )}
            {windowWidth > 624 && <PpSpacer vSpacing="xl"></PpSpacer>}
            {!uploadError && (
                <div>
                    Please provide any emails, letters, screenshots, or other documents that support your claim.
                    <PpSpacer vSpacing="m"></PpSpacer>
                    You can attach a maximum of 5 documents. Each document should be no more than 10MB. Uploaded file
                    must be PDF, DOC, JPEG, or PNG.
                    <PpSpacer vSpacing="xl"></PpSpacer>
                    <GoabFormItem label="Upload files" requirement="optional">
                        <Controller
                            name="documents.files"
                            control={control}
                            render={({ field, fieldState }) => {
                                onFilesChangeReference.current = field.onChange; //updates the controller
                                filesValueReference.current = field.value ?? []; //retains list of current files

                                return (
                                    <>
                                        <GoabFileUploadInput
                                            onSelectFile={upload}
                                            variant="dragdrop"
                                            accept={getAcceptedMimes()}
                                            maxFileSize="10MB"
                                            testId="file-upload"
                                        />
                                        {uploads.map((upload, index) => (
                                            <GoabFileUploadCard
                                                key={upload.name || index}
                                                filename={upload.name}
                                                type={upload.type}
                                                size={upload.size}
                                                progress={progressList[upload.name]}
                                                onDelete={() => deleteFile(upload)}
                                                onCancel={() => deleteFile(upload)}
                                                testId="file-upload-card"
                                            />
                                        ))}
                                        {fieldState?.error && (
                                            <WarningIndicator message={fieldState?.error.message}></WarningIndicator>
                                        )}
                                    </>
                                );
                            }}
                        />
                    </GoabFormItem>
                    {showDocumentationArea && (
                        <>
                            <PpSpacer vSpacing="xl"></PpSpacer>
                            Please add brief description for each uploaded file to provide context for the
                            documentation.
                            <PpSpacer vSpacing="xs"></PpSpacer>
                            <div className={style['documentation-description']}>
                                <GoabFormItem>
                                    <MandatoryFieldLabel label="Describe documentation"></MandatoryFieldLabel>
                                    <Controller
                                        name="documents.documentation"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <GoabTextarea
                                                    width="100%"
                                                    name={field.name}
                                                    error={!!fieldState?.error}
                                                    onChange={({ value }) => {
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value}
                                                    countBy="character"
                                                    maxCount={1500}
                                                    testId="documentation-text-area"
                                                ></GoabTextarea>
                                                {fieldState?.error && (
                                                    <WarningIndicator
                                                        message={fieldState?.error.message}
                                                    ></WarningIndicator>
                                                )}
                                            </>
                                        )}
                                    />
                                </GoabFormItem>
                            </div>
                        </>
                    )}
                </div>
            )}
            {uploadError && (
                <div className={style['error-page']}>
                    <ErrorPage></ErrorPage>
                    <div>
                        <GoabButton
                            mt="m"
                            mb="xl"
                            type="primary"
                            onClick={() => window.location.reload()}
                            testId="reload-button"
                        >
                            Reload
                        </GoabButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step3;
