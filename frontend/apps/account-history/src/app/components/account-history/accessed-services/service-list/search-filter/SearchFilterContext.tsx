import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DropDownEntry } from 'shared/src/lib/accessed-service-details/types/Constants';

interface SearchFilterContextType {
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    categories: DropDownEntry[];
    setCategories: React.Dispatch<React.SetStateAction<DropDownEntry[]>>;
    selectedCategories: DropDownEntry[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<DropDownEntry[]>>;
    sortBy: string | null;
    setSortBy: React.Dispatch<React.SetStateAction<string | null>>;
    openFilter: boolean;
    setOpenFilter: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);

export const useSearchFilter = (): SearchFilterContextType => {
    const context = useContext(SearchFilterContext);
    if (!context) {
        throw new Error('useSearchFilter must be used within a SearchFilterProvider');
    }
    return context;
};

interface SearchFilterProviderProperties {
    children: ReactNode;
}

export const SearchFilterProvider: React.FC<SearchFilterProviderProperties> = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<DropDownEntry[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<DropDownEntry[]>([]);
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [openFilter, setOpenFilter] = useState<boolean>(false);

    return (
        <SearchFilterContext.Provider
            value={{
                searchTerm,
                setSearchTerm,
                categories,
                setCategories,
                selectedCategories,
                setSelectedCategories,
                sortBy,
                setSortBy,
                openFilter,
                setOpenFilter,
            }}
        >
            {children}
        </SearchFilterContext.Provider>
    );
};
