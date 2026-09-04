import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdutLogSearchFilterContextType {
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    email: string | undefined;
    setEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
    actions: string[];
    setActions: React.Dispatch<React.SetStateAction<string[]>>;
    beginDate: Date | undefined;
    setBeginDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    endDate: Date | undefined;
    setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    openFilter: boolean;
    setOpenFilter: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuditLogSearchFilterContext = createContext<AdutLogSearchFilterContextType | undefined>(undefined);

export const useAuditLogSearchFilter = (): AdutLogSearchFilterContextType => {
    const context = useContext(AuditLogSearchFilterContext);
    if (!context) {
        throw new Error('useAuditLogSearchFilter must be used within a AuditLogSearchFilterProvider');
    }
    return context;
};

export const AuditLogSearchFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [email, setEmail] = useState<string | undefined>();
    const [actions, setActions] = useState<string[]>([]);
    const [beginDate, setBeginDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [openFilter, setOpenFilter] = useState<boolean>(false);

    return (
        <AuditLogSearchFilterContext.Provider
            value={{
                searchTerm,
                setSearchTerm,
                email,
                setEmail,
                actions,
                setActions,
                beginDate,
                setBeginDate,
                endDate,
                setEndDate,
                openFilter,
                setOpenFilter,
            }}
        >
            {children}
        </AuditLogSearchFilterContext.Provider>
    );
};
