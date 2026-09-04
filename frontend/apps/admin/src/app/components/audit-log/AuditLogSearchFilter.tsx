import React, { useCallback, useEffect, useState } from 'react';
import {
    GoabInput,
    GoabButton,
    GoabCheckbox,
    GoabModal,
    GoabDatePicker,
    GoabFormItem,
    GoabButtonGroup,
    GoabIcon,
} from '@abgov/react-components';
import styles from './AuditLogSearchFilter.module.scss';
import { AdminAuditActions } from '../../types/Constants';
import { useAuditLogSearchFilter } from './AuditLogSearchFilterContext';
import { formatCanadaDateOnlyString, formatDateOnlyString, formatDateString } from '../../utils/dateUtils';
import { useThrottle } from '../../utils/useThrottle';

interface CheckBoxItem {
    label: string;
    checked: boolean;
}
const SearchFilter: React.FC = () => {
    const {
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
    } = useAuditLogSearchFilter();
    const [checkedActions, setCheckedActions] = useState<string[]>([]);
    const [selectedBeginDate, setSelectedBeginDate] = useState<Date | undefined>();
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>();
    const [selectedEmail, setSelectedEmail] = useState<string | undefined>();
    const [actionAreaKey, setActionAreaKey] = useState<number>(1);
    const [keyword, setKeyword] = useState<string>('');
    const throttledPattern = useThrottle(keyword, 800);

    const [allActions, setAllActions] = useState<CheckBoxItem[]>(() => {
        return AdminAuditActions.map((x) => {
            return { label: x, checked: false };
        });
    });

    useEffect(() => {
        setSearchTerm(throttledPattern);
    }, [throttledPattern]);

    const handleActionCheckboxChange = (name: string, checked: boolean) => {
        let actions: string[] = [];
        if (checked) {
            const newAction = AdminAuditActions.find((x) => x === name);
            if (newAction) {
                actions = [...new Set([...checkedActions, newAction])];
            }
        } else {
            actions = checkedActions.filter((item) => item !== name);
        }
        setCheckedActions(actions);
    };

    const clearFilters = () => {
        for (const item of allActions) {
            item.checked = false;
        }
        if (actionAreaKey === 1) {
            setActionAreaKey(2);
        } else {
            setActionAreaKey(1);
        }
        setCheckedActions([]);
        setSelectedEmail(undefined);
        setSelectedBeginDate(undefined);
        setSelectedEndDate(undefined);
    };
    const applyFilters = () => {
        checkedActions.sort();
        setActions(checkedActions);
        setEmail(selectedEmail);
        setBeginDate(selectedBeginDate);
        setEndDate(selectedEndDate);
        setOpenFilter(false);
    };

    const disableAutocompleteOnSearchBox = () => {
        //This is a workaround to turn off autocomplete in the search text box, as the GoA component doesn't have a way to do this.
        document
            .querySelector('goa-input[type="search"]')
            ?.shadowRoot?.querySelector('input[type="search"]')
            ?.setAttribute('autocomplete', 'off');
    };

    useEffect(() => {
        disableAutocompleteOnSearchBox();
    }, []);

    return (
        <>
            <div className={styles['filter-disp-container']}>
                {(beginDate || endDate || email || actions.length > 0) && (
                    <div className={styles['filter-header-label']}>Selected Filters: </div>
                )}
                <div className={styles['filter-items-container']}>
                    {(beginDate || endDate) && (
                        <div className={styles['filter-display-item']}>
                            {beginDate && !endDate && `After ${formatDateOnlyString(beginDate)}`}
                            {beginDate &&
                                endDate &&
                                `${formatDateOnlyString(beginDate)} - ${formatDateOnlyString(endDate)}`}
                            {!beginDate && endDate && `Before ${formatDateOnlyString(endDate)}`}
                        </div>
                    )}
                    {email && <div className={styles['filter-display-item']}>User: {email}</div>}
                    {actions.length === AdminAuditActions.length ? (
                        <div className={styles['filter-display-item']}>Action: All</div>
                    ) : (
                        actions.map((item, index) => (
                            <div key={index} className={styles['filter-display-item']}>
                                Action: {item}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className={styles['search-filter-container']}>
                <div className={styles['search-box-container']}>
                    <GoabInput
                        type="search"
                        leadingIcon="search"
                        width="100%"
                        name="searchBox"
                        placeholder="Type keyword to search description"
                        value={searchTerm}
                        onChange={({ value }) => setKeyword(value)}
                    ></GoabInput>
                </div>
                <div className={styles['search-filter-divider']}></div>

                <div
                    className={`${styles['filter-button-container']} ${
                        actions.length > 0 || email || beginDate || endDate ? styles['selected'] : ''
                    }`}
                >
                    <GoabButton type="secondary" variant="normal" onClick={() => setOpenFilter(true)}>
                        <GoabIcon type="filter" />
                    </GoabButton>
                </div>

                <GoabModal
                    role="dialog"
                    open={openFilter}
                    onClose={() => setOpenFilter(false)}
                    heading="Filters"
                    maxWidth="480px"
                >
                    <div className={styles['filter-modal-body']}>
                        <div className={styles['filter-category-checkbox-container']}>
                            <GoabFormItem label="User Email">
                                <GoabInput
                                    name="email"
                                    value={selectedEmail}
                                    width="40ch"
                                    onChange={({ value }) => {
                                        setSelectedEmail(value);
                                    }}
                                ></GoabInput>
                            </GoabFormItem>
                        </div>
                        <div className={styles['filter-title-category']}>Action</div>
                        <div className={styles['filter-category-checkbox-container']} key={actionAreaKey}>
                            {allActions.map((item, index) => (
                                <GoabCheckbox
                                    key={index}
                                    name={item.label}
                                    text={item.label}
                                    checked={item.checked}
                                    onChange={({ name, checked }) => handleActionCheckboxChange(name ?? '', checked)}
                                ></GoabCheckbox>
                            ))}
                        </div>

                        <div className={styles['filter-sortby-radio-container']}>
                            <GoabFormItem label="Begin Date">
                                <GoabDatePicker
                                    name="item"
                                    value={selectedBeginDate}
                                    onChange={({ value }) =>
                                        setSelectedBeginDate(
                                            typeof value === 'string' ? (value ? new Date(value) : undefined) : value
                                        )
                                    }
                                    mb="xl"
                                ></GoabDatePicker>
                            </GoabFormItem>
                            <GoabFormItem label="End Date">
                                <GoabDatePicker
                                    name="item"
                                    min={selectedBeginDate}
                                    value={selectedEndDate}
                                    onChange={({ value }) =>
                                        setSelectedEndDate(
                                            typeof value === 'string' ? (value ? new Date(value) : undefined) : value
                                        )
                                    }
                                    mb="xl"
                                ></GoabDatePicker>
                            </GoabFormItem>
                        </div>
                        <div className={styles['services-filter-btn-container']}>
                            <GoabButtonGroup alignment="end">
                                <GoabButton type="secondary" onClick={clearFilters} width="100%">
                                    Clear
                                </GoabButton>
                                <GoabButton type="primary" onClick={applyFilters} width="100%">
                                    Set filter
                                </GoabButton>
                            </GoabButtonGroup>
                        </div>
                    </div>
                </GoabModal>
            </div>
        </>
    );
};

export default SearchFilter;
