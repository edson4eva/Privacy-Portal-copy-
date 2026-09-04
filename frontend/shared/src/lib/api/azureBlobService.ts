import { BlobServiceClient } from '@azure/storage-blob';
import { post } from './dataService';
import { CORRELATION_ID } from '../utils/constants';
import { isDemoMode } from '../utils/demoMode';

interface UploadFileResponse {
    success: boolean;
    message: string;
    url?: string;
}
interface SasTokenResponse {
    uri: string;
}

export let storedSasToken: string;
export let downloadSasToken: string;

export const getSasToken = async (correlationId:string): Promise<string> => {
    if (isDemoMode()) {
        return '';
    }

    try {
        const response: SasTokenResponse = await post('v1/sas-token', {},{headers: { [CORRELATION_ID]: correlationId }});

        if (response && response.uri) {
            storedSasToken = response.uri.toString();
            return storedSasToken!;
        } else {
            throw new Error('Failed to retrieve SAS token');
        }
    } catch (error) {
        console.error('Error fetching SAS token:', error);
        throw error;
    }
};

export const getDownloadSasToken = async (blobName: string, correlationId: string): Promise<string> => {
    if (isDemoMode()) {
        return '';
    }

    try {
        const response: SasTokenResponse = await post('v1/sas-token/download', { blobName },{headers: { [CORRELATION_ID]: correlationId }});

        if (response && response.uri) {
            downloadSasToken = response.uri.toString();
            return downloadSasToken!;
        } else {
            throw new Error('Failed to retrieve SAS token to download');
        }
    } catch (error) {
        console.error('Error fetching SAS token to download:', error);
        throw error;
    }
};

export const getStoredSasToken = (): string => {
    if (storedSasToken) {
        return storedSasToken;
    } else {
        console.error('No sas token stored!');
        return '';
    }
};

export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
    if (isDemoMode()) {
        // No storage account to write to; report success so an attachment does
        // not block the flow. The file is not uploaded anywhere.
        return {
            success: true,
            message: `File accepted (demo mode - not uploaded).`,
            url: `#demo/${file.name}`,
        };
    }

    try {
        const containerName = process.env.NX_PUBLIC_AZURE_CONTAINER_NAME || '';
        const sasToken = getStoredSasToken();
        const blobServiceClient = new BlobServiceClient(sasToken);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = file.name;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(file);

        return {
            success: true,
            message: `File uploaded successfully.`,
            url: blockBlobClient.url,
        };
    } catch (error) {
        console.error('Error uploading file to Azure Blob Storage:', error);
        return {
            success: false,
            message: `File upload failed.`,
        };
    }
};
