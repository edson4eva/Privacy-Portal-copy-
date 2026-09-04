import React, { useEffect, useState } from 'react';
import { GoabInput, GoabButton, GoabCheckbox, GoabRadioGroup, GoabRadioItem, GoabModal } from '@abgov/react-components';
import { useSearchFilter } from './SearchFilterContext';
import styles from './SearchFilter.module.scss';
import { Categories, DropDownEntry } from 'shared/src/lib/accessed-service-details/types/Constants';
import ApplyFilterButton from './ApplyFilterButton';

const SearchFilter: React.FC = () => {
    const {
        searchTerm,
        setSearchTerm,
        categories,
        selectedCategories,
        setSelectedCategories,
        setSortBy,
        openFilter,
        setOpenFilter,
    } = useSearchFilter();
    const [checkedCategories, setCheckedCategories] = useState<DropDownEntry[]>([]);
    const [selectedSortBy, setSelectedSortBy] = useState<string | null>(null);

    const handleCategoryCheckboxChange = (name: string, checked: boolean) => {
        let categories: DropDownEntry[] = [];
        if (checked) {
            const newCategory = Categories.find((x) => x.id === name);
            if (newCategory) {
                categories = [...new Set([...checkedCategories, newCategory])];
            }
        } else {
            categories = checkedCategories.filter((item) => item.id !== name);
        }
        setCheckedCategories(categories);
    };

    const applyFilters = () => {
        setSelectedCategories(checkedCategories);
        setSortBy(selectedSortBy);
        setOpenFilter(false);
    };

    const disableAutocompleteOnSearchBox = () => {
        //This is a workaround to turn off autocomplete in the search text box, as the GoA component doesn't have a way to do this.
        document
            .querySelector('goa-input')
            ?.shadowRoot?.querySelector('input[type="search"]')
            ?.setAttribute('autocomplete', 'off');
    };

    useEffect(() => {
        disableAutocompleteOnSearchBox();
    }, []);

    return (
        <div className={styles['search-filter-container']}>
            <div className={styles['search-box-container']}>
                <GoabInput
                    type="search"
                    leadingIcon="search"
                    width="100%"
                    name="searchBox"
                    placeholder="Type keyword or service"
                    value={searchTerm}
                    onChange={({ value }) => setSearchTerm(value)}
                ></GoabInput>
            </div>
            <div className={styles['search-filter-divider']}></div>

            <div
                className={`${styles['filter-button-container']} ${
                    selectedCategories.length > 0 ? styles['selected'] : ''
                }`}
            >
                <GoabButton type="secondary" variant="normal" onClick={() => setOpenFilter(true)} width="8.3125rem">
                    <div className={styles['filter-button-body']}>
                        <div className={styles['filter-button-icon']}>
                            <goa-icon type="filter"></goa-icon>
                        </div>
                        <div className={styles['filter-button-text']}>Filters</div>
                        {selectedCategories.length > 0 && (
                            <div className={styles['filter-selection-count']}>{selectedCategories.length}</div>
                        )}
                    </div>
                </GoabButton>
            </div>

            <GoabModal
                role="dialog"
                open={openFilter}
                heading="Filters"
                onClose={() => setOpenFilter(false)}
                maxWidth="480px"
                actions={<ApplyFilterButton applyFilters={applyFilters} />}
            >
                <div className={styles['filter-modal-body']}>
                    <div className={styles['filter-title-category']}>Category</div>
                    <div className={styles['filter-category-checkbox-container']}>
                        {categories.map((item, index) => (
                            <GoabCheckbox
                                key={index}
                                name={item.id}
                                text={item.label}
                                onChange={({ name, checked }) => handleCategoryCheckboxChange(name ?? '', checked)}
                            ></GoabCheckbox>
                        ))}
                    </div>

                    <div className={styles['filter-title-sortby']}>Sort by</div>
                    <div className={styles['filter-sortby-radio-container']}>
                        <GoabRadioGroup name="sort-by" onChange={({ value }) => setSelectedSortBy(value)}>
                            <GoabRadioItem value="earliest-accessed" label="Earliest accessed" />
                            <GoabRadioItem value="latest-accessed" label="Latest accessed" />
                        </GoabRadioGroup>
                    </div>
                </div>
            </GoabModal>
        </div>
    );
};

export default SearchFilter;
