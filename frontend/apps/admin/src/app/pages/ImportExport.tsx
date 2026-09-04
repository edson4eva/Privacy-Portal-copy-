import {
    GoabButton,
    GoabButtonGroup,
    GoabContainer,
    GoabFileUploadCard,
    GoabFileUploadInput,
    GoabFormItem,
    GoabModal,
    GoabSpacer,
} from '@abgov/react-components';
import styles from './ImportExport.module.scss';
import { useState } from 'react';
import { gzip } from 'pako';
import { post } from 'shared/src/lib/api/dataService';
import { ImportResult } from '../types/ImportResult';

const ImportExport = (): React.ReactElement => {
    const [upload, setUpload] = useState<File | undefined>();
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [header, setHeader] = useState<string | undefined>();

    const confirmImport = () => {
        setShowDialog(true);
    };
    const importDraft = () => {
        if (upload !== undefined) {
            const reader = new FileReader();
            reader.onload = async (event: ProgressEvent<FileReader>) => {
                if (!event.target) return;
                const content = reader.result as string;
                const compressedFile = gzip(content);

                const response = await post<ImportResult, any>(
                    process.env.NX_PUBLIC_API_URL + 'v1/drafts/import',
                    compressedFile,
                    {
                        headers: { 'Content-Encoding': 'gzip' },
                        redirectOnError: false,
                    }
                );
                setHeader(`${response.names.length} service(s) successfully imported!`);
                setUpload(undefined);
                setShowDialog(false);
            };
            reader.readAsText(upload);
        }
    };
    const addFileForUpload = (detail: { file: File }) => {
        const file = detail.file;
        if (file && file.type === 'application/json') {
            setUpload(file);
        }
    };

    const downloadDraft = () => {
        window.open(process.env.NX_PUBLIC_API_URL + 'v1/drafts/export');
    };
    return (
        <div className={styles['container']}>
            <div className={styles['service-name-badge-container']} data-testid="service-name-badge-container">
                <div className={styles['service-name']} data-testid="service-name">
                    Import/Export Services Drafts
                </div>
            </div>

            {header && <p>{header}</p>}
            <div className={styles['button-container']} data-testid="button-container">
                <GoabButton type="primary" variant="normal" leadingIcon="download" onClick={downloadDraft}>
                    Export From Drafts Table
                </GoabButton>
            </div>
            <GoabContainer accent="thin" padding="relaxed" width="full">
                <GoabFormItem label="Select a file to import into Drafts Table" labelSize="regular">
                    {upload ? (
                        <GoabFileUploadCard
                            key={upload.name}
                            filename={upload.name}
                            type={upload.type}
                            size={upload.size}
                            progress={0}
                            onDelete={() => {
                                setUpload(undefined);
                            }}
                            onCancel={() => {
                                setUpload(undefined);
                            }}
                            testId="file-upload-card"
                        />
                    ) : (
                        <GoabFileUploadInput
                            onSelectFile={addFileForUpload}
                            variant="dragdrop"
                            accept="application/json"
                            maxFileSize="10MB"
                        />
                    )}
                </GoabFormItem>
                {upload && (
                    <GoabButton type="primary" variant="normal" leadingIcon="cloud-upload" onClick={confirmImport}>
                        Import Into Drafts
                    </GoabButton>
                )}
            </GoabContainer>

            <div className={styles['service-access-history']} data-testid="service-access-history">
                Drafts & Services
            </div>
            <GoabSpacer vSpacing={'s'}></GoabSpacer>

            <GoabModal
                heading="Are you sure you want to import the file?"
                role="alertdialog"
                open={showDialog}
                onClose={() => setShowDialog(false)}
                actions={
                    <GoabButtonGroup alignment="end">
                        <GoabButton type="tertiary" onClick={() => setShowDialog(false)}>
                            Cancel
                        </GoabButton>
                        <GoabButton type="primary" onClick={importDraft}>
                            Continue
                        </GoabButton>
                    </GoabButtonGroup>
                }
            >
                <p>The file will be imported into Drafts table and existing drafts will be overwritten.</p>
            </GoabModal>
        </div>
    );
};

export default ImportExport;
