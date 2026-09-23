import React, { useMemo } from 'react';
import Select, { MultiValue, components, ValueContainerProps } from 'react-select';

export interface DropdownOption {
    value: string;
    label: string;
}

interface MultiSelectDropdownProperties {
    label: string;
    options: DropdownOption[];
    selectedOptions: DropdownOption[];
    onChange: (newValue: DropdownOption[]) => void;
}

const createCustomValueContainer = (label: string) => {
    const Component = ({ children, ...properties }: ValueContainerProps<DropdownOption, true>) => {
        const { getValue, hasValue } = properties;
        const nbSelected = getValue().length;

        return (
            <components.ValueContainer {...properties}>
                {hasValue && <span style={{ marginLeft: 5, marginRight: 5 }}>{nbSelected} selected</span>}
                {children}
            </components.ValueContainer>
        );
    };
    Component.displayName = 'CustomValueContainer';
    return Component;
};

const CustomOption = (properties: any) => {
    return (
        <components.Option {...properties}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <input
                    type="checkbox"
                    checked={properties.isSelected}
                    onChange={() => null}
                    style={{ marginRight: 10, width: 24, height: 24, flexShrink: 0 }}
                />
                {properties.label}
            </div>
        </components.Option>
    );
};

const HiddenMultiValue = () => null;

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProperties> = ({
    label,
    options,
    selectedOptions,
    onChange,
}) => {
    const CustomValueContainer = useMemo(() => createCustomValueContainer(label), [label]);

    return (
        <Select<DropdownOption, true>
            isMulti
            isSearchable
            placeholder={selectedOptions.length > 0 ? '' : 'Select all that apply...'}
            value={selectedOptions}
            onChange={(newValue) => onChange([...newValue])}
            options={options}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{
                ValueContainer: CustomValueContainer,
                Option: CustomOption,
                MultiValue: HiddenMultiValue,
            }}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            styles={{
                control: (base) => ({ ...base, borderColor: 'var(--goa-color-greyscale-700)', width: '100%' }),
                container: (base) => ({ ...base, width: '100%' }),
                valueContainer: (base) => ({ ...base, overflow: 'visible' }),
                input: (base) => ({ ...base, minWidth: '60px' }),
                placeholder: (base) => ({ ...base, pointerEvents: 'none' }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? 'var(--goa-color-greyscale-100)' : 'transparent',
                    color: 'var(--goa-color-greyscale-black)',
                    ':active': { backgroundColor: 'var(--goa-color-greyscale-150)' },
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
            }}
        />
    );
};
