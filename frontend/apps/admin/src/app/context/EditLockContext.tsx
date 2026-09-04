import React, { createContext, ReactNode, useContext, useState } from 'react';
import { PublishStatus } from '../types/PublishStatus';

type EditLock = {
    canEdit: boolean;
    status: number;
};
export type SectionEditStatus = {
    index: number;
    isEditing: boolean;
};

type EditLockContextType = {
    editLock: EditLock;
    setEditLock: React.Dispatch<React.SetStateAction<EditLock>>;
    showSaveMessage: boolean;
    setShowSaveMessage: React.Dispatch<React.SetStateAction<boolean>>;
    saveMessage: string;
    setSaveMessage: React.Dispatch<React.SetStateAction<string>>;
    isEditingMainInfo: boolean;
    setIsEditingMainInfo: React.Dispatch<React.SetStateAction<boolean>>;
    isEditingInternalInfo: boolean;
    setIsEditingInternalInfo: React.Dispatch<React.SetStateAction<boolean>>;
    sectionStatus: SectionEditStatus[];
    setSectionStatus: React.Dispatch<React.SetStateAction<SectionEditStatus[]>>;
};

const EditLockContext = createContext<EditLockContextType | undefined>(undefined);

type EditLockContextProviderProperties = {
    children: ReactNode;
};

export const EditLockContextProvider = ({ children }: EditLockContextProviderProperties) => {
    const [editLock, setEditLock] = useState<EditLock>({ canEdit: true, status: PublishStatus.NotStarted });
    const [showSaveMessage, setShowSaveMessage] = useState<boolean>(false);
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [isEditingMainInfo, setIsEditingMainInfo] = useState<boolean>(false);
    const [isEditingInternalInfo, setIsEditingInternalInfo] = useState<boolean>(false);
    const [sectionStatus, setSectionStatus] = useState<SectionEditStatus[]>([]);

    return (
        <EditLockContext.Provider
            value={{
                editLock,
                setEditLock,
                saveMessage,
                setSaveMessage,
                showSaveMessage,
                setShowSaveMessage,
                isEditingMainInfo,
                setIsEditingMainInfo,
                isEditingInternalInfo,
                setIsEditingInternalInfo,
                sectionStatus,
                setSectionStatus,
            }}
        >
            {children}
        </EditLockContext.Provider>
    );
};

// Custom hook to use the EditLockContext
export const useEditLockContext = () => {
    const context = useContext(EditLockContext);
    if (!context) {
        throw new Error('useEditLockContext must be used within a EditLockContextProvider');
    }
    return context;
};
