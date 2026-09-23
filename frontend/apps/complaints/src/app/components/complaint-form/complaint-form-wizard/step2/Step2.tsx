/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, Controller } from 'react-hook-form';
import style from './Step2.module.scss';
import {
    GoabButton,
    GoabFormItem,
    GoabIcon,
    GoabInput,
    GoabRadioGroup,
    GoabRadioItem,
    GoabTextarea,
} from '@abgov/react-components';
import departments from 'shared/src/lib/models/department-code';
import { useEffect, useState } from 'react';

import PpContainer from 'shared/src/lib/pp-container/PpContainer';
import WarningIndicator from 'shared/src/lib/warning-indicator/WarningIndicator';
import MandatoryFieldLabel from 'shared/src/lib/mandatory-field-label/MandatoryFieldLabel';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';

interface Step2Property {
    control: Control<any>;
    editPreviousStep: (value: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Step2 = ({ control, editPreviousStep }: Step2Property): React.ReactElement => {
    const [userEmail, setUserEmail] = useState<string | undefined>('');
    const [firstName, setFirstName] = useState<string | undefined>('');
    const [lastName, setLastName] = useState<string | undefined>('');
    const [isVerified, setIsVerified] = useState<boolean | undefined>(false);
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const windowWidth = useWindowWidth();
    const department = departments.find((department) => department.key === control._formValues.department)?.value;
    const service = control._formValues.service;
    const isTablet = windowWidth > 624 && windowWidth < 1024;

    const onClickEdit = () => {
        editPreviousStep(true);
    };

    useEffect(() => {
        if (user?.isVerified) {
            setUserEmail(user?.email);
            setFirstName(user?.firstName);
            setLastName(user?.lastName);
            setIsVerified(user?.isVerified);
            control._formValues.email = user?.email;
            control._formValues.firstName = user?.firstName;
            control._formValues.lastName = user?.lastName;
        }
    }, [user]);

    return (
        <>
            {windowWidth < 624 && (
                <>
                    <PageTitle title="FILE A COMPLAINT" />
                    <PpSpacer vSpacing={'s'}></PpSpacer>
                    <PageSubTitle subTitle="Provide details" />
                    <PpSpacer vSpacing="s"></PpSpacer>
                </>
            )}
            {windowWidth > 624 && <PpSpacer vSpacing="xl"></PpSpacer>}
            <div className={style['custom-pp-container-step2']}>
                <PpContainer containerBorderColor="var(--goa-color-info-default)" containerBoxShadow="none">
                    <div className={style['info-container']}>
                        <div className={style['department']}>
                            <div>
                                <div className={style['heading']}>Department</div>
                                <div data-testid="department-step2-value">{department}</div>
                            </div>
                            <div>
                                <GoabButton
                                    type="tertiary"
                                    size="compact"
                                    variant="normal"
                                    leadingIcon="pencil"
                                    testId="edit-step-one-button"
                                    onClick={onClickEdit}
                                >
                                    {windowWidth > 623 && <span>Edit</span>}
                                </GoabButton>
                            </div>
                        </div>
                        {service && (
                            <div className={style['service']}>
                                <div className={style['heading']}>Service</div>
                                <div data-testid="service-step2-value">{service}</div>
                            </div>
                        )}
                    </div>
                </PpContainer>
            </div>
            <PpSpacer vSpacing="xl"></PpSpacer>
            <div className={style['supporting-details']}>Supporting details</div>
            <PpSpacer vSpacing="m"></PpSpacer>
            Please provide any other information that will help us investigate your complaint.
            <PpSpacer vSpacing="m"></PpSpacer>
            <GoabFormItem>
                <MandatoryFieldLabel label="Which option best describes your privacy concern?"></MandatoryFieldLabel>
                <Controller
                    name="concern"
                    control={control}
                    defaultValue={null}
                    render={({ field, fieldState }) => (
                        <>
                            <GoabRadioGroup
                                orientation="vertical"
                                name="item"
                                value={field.value || ''}
                                onChange={({ value }) => {
                                    field.onChange(value);
                                }}
                            >
                                <GoabRadioItem
                                    value="1"
                                    label="Unauthorized access"
                                    description="My personal information was accessed without permission, whether intentional or accidental (including snooping)."
                                ></GoabRadioItem>
                                <GoabRadioItem
                                    value="2"
                                    label="Unauthorized disclosure"
                                    description="My personal information was shared without my consent, either intentionally or by mistake (e.g., sent to the wrong recipient via email or mail)."
                                ></GoabRadioItem>
                                <GoabRadioItem
                                    value="3"
                                    label="Loss of personal information"
                                    description="My personal information was lost due to an incident (e.g., theft, fire, flood)."
                                ></GoabRadioItem>
                                <GoabRadioItem
                                    value="4"
                                    label="Inaccurate information"
                                    description="My personal information is incorrect."
                                ></GoabRadioItem>
                                <GoabRadioItem
                                    value="5"
                                    label="Overcollection"
                                    description="More personal information was collected than necessary."
                                ></GoabRadioItem>
                                <GoabRadioItem
                                    value="6"
                                    label="Security breach"
                                    description="My personal information was compromised due to hacking, phishing, theft (e.g., stolen laptop, office break-in), or weak security measures."
                                ></GoabRadioItem>
                                <GoabRadioItem
                                    value="7"
                                    label="Other"
                                    description="Please specify details in the next question."
                                ></GoabRadioItem>
                            </GoabRadioGroup>
                            {fieldState?.error && (
                                <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                            )}
                        </>
                    )}
                />
            </GoabFormItem>
            <PpSpacer vSpacing="xl"></PpSpacer>
            Can you describe the circumstances under which you believe your personal information was improperly
            accessed, collected, used, disclosed, or destroyed? Please provide any details or evidence that may support
            your complaint.
            <PpSpacer vSpacing="l"></PpSpacer>
            <GoabFormItem>
                <MandatoryFieldLabel label="Describe circumstances"></MandatoryFieldLabel>
                <Controller
                    name="circumstances"
                    control={control}
                    render={({ field, fieldState }) => (
                        <>
                            <GoabTextarea
                                name={field.name}
                                width="100%"
                                error={!!fieldState?.error}
                                onChange={({ value }) => {
                                    field.onChange(value);
                                }}
                                value={field.value}
                                countBy="character"
                                maxCount={2500}
                                testId="circumstances-text-area"
                            />
                            {fieldState?.error && (
                                <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                            )}
                        </>
                    )}
                />
            </GoabFormItem>
            <PpSpacer vSpacing="xl"></PpSpacer>
            If applicable or available, please provide the name of the employee that you interacted with.
            <PpSpacer vSpacing="l"></PpSpacer>
            <GoabFormItem label="Employee name" requirement="optional">
                <Controller
                    name="employeeName"
                    control={control}
                    render={({ field }) => (
                        <GoabInput
                            name={field.name}
                            width="20.81rem"
                            onChange={({ value }) => {
                                field.onChange(value);
                            }}
                            value={field.value}
                            testId="employee-name"
                        />
                    )}
                />
            </GoabFormItem>
            <PpSpacer vSpacing="xl"></PpSpacer>
            <div className={style['supporting-details']}>Contact Information</div>
            <PpSpacer vSpacing="l"></PpSpacer>
            Please give us your contact information so we can contact you about your complaint.
            <PpSpacer vSpacing="m"></PpSpacer>
            {isVerified && (
                <>
                    <div className={style['decide-alert']}>
                        <div>
                            <GoabIcon type="alert-circle" theme="outline"></GoabIcon>
                        </div>
                        <div>
                            Decide whether you want to use your Alberta.ca Account email to be contacted, or update the
                            email below.
                        </div>
                    </div>
                    <PpSpacer vSpacing="l"></PpSpacer>
                </>
            )}
            <div>
                <div className={`${!isTablet ? style['names'] : ''}`}>
                    <GoabFormItem>
                        <MandatoryFieldLabel label="First name"></MandatoryFieldLabel>
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field, fieldState }) => (
                                //<div className={`${isVerified ? style['name-outline'] : ''}`}>
                                <div>
                                    <input
                                        aria-label="Enter first name"
                                        name={field.name}
                                        style={{
                                            width:
                                                windowWidth > 1024
                                                    ? '21.86rem'
                                                    : windowWidth < 624
                                                      ? 'calc(21.86rem)'
                                                      : 'calc(45rem)',
                                            height: '2.625rem',
                                            border: '1px solid ' + (fieldState?.error ? 'red' : 'black'),
                                            borderRadius: '5px',
                                        }}
                                        className={fieldState?.error ? 'input-error' : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value);
                                            setFirstName(value);
                                        }}
                                        value={firstName}
                                        readOnly={isVerified}
                                        data-testid="first-name"
                                    />
                                    {fieldState?.error && (
                                        <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                                    )}
                                </div>
                                //     <GoabInput
                                //         ariaLabel="Enter first name"
                                //         name={field.name}
                                //         width="21.86rem"
                                //         error={!!fieldState?.error}
                                //         onChange={({ value }) => {
                                //             field.onChange(value);
                                //         }}
                                //         value={firstName}
                                //         readonly={isVerified}
                                //         // disabled={isVerified} comementing this as this is an issue with latest GoA design package
                                //         testId="first-name"
                                //     />
                                // )}
                            )}
                        />
                    </GoabFormItem>
                    {isTablet && <div className={style['spacer']} />}
                    <GoabFormItem>
                        <MandatoryFieldLabel label="Last name"></MandatoryFieldLabel>
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field, fieldState }) => (
                                // <div className={`${isVerified ? style['name-outline'] : ''}`}>
                                <div>
                                    <input
                                        aria-label="Enter last name"
                                        name={field.name}
                                        style={{
                                            width:
                                                windowWidth > 1024
                                                    ? '21.86rem'
                                                    : windowWidth < 624
                                                      ? 'calc(21.86rem)'
                                                      : 'calc(45rem)',
                                            height: '2.625rem',
                                            border: '1px solid ' + (fieldState?.error ? 'red' : 'black'),
                                            borderRadius: '5px',
                                        }}
                                        className={fieldState?.error ? 'input-error' : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value);
                                            setLastName(value);
                                        }}
                                        value={lastName}
                                        readOnly={isVerified}
                                        data-testid="last-name"
                                    />
                                    {fieldState?.error && (
                                        <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                                    )}
                                </div>
                            )}
                        />
                    </GoabFormItem>
                </div>
            </div>
            {isTablet ? <div className={style['spacer']} /> : <PpSpacer vSpacing="l" />}
            <div>
                <div className={`${!isTablet ? style['emails'] : ''}`}>
                    <GoabFormItem>
                        <MandatoryFieldLabel label="Email"></MandatoryFieldLabel>
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                    message: 'Write correct email format',
                                },
                            }}
                            render={({ field, fieldState }) => (
                                <>
                                    {/* <div className={`${isTablet ? style['tablet-background'] : ''}`}>
                                        <GoabInput
                                            ariaLabel="Enter email"
                                            name={field.name}
                                            width={!isTablet ? '21.86rem' : 'calc(45rem)'}
                                            onChange={({ value }) => {
                                                field.onChange(value);
                                            }}
                                            value={userEmail}
                                            error={!!fieldState?.error}
                                            testId="email"
                                        />
                                        {fieldState?.error && (
                                            <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                                        )}
                                    </div> */}
                                    <div>
                                        <input
                                            aria-label="Enter email"
                                            name={field.name}
                                            style={{
                                                width:
                                                    windowWidth > 1024
                                                        ? '21.86rem'
                                                        : windowWidth < 624
                                                          ? 'calc(21.86rem)'
                                                          : 'calc(45rem)',
                                                height: '2.625rem',
                                                border: '1px solid ' + (fieldState?.error ? 'red' : 'black'),
                                                borderRadius: '5px',
                                            }}
                                            className={fieldState?.error ? 'input-error' : ''}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                setUserEmail(e.target.value);
                                            }}
                                            value={userEmail}
                                            data-testid="email"
                                        />
                                        {fieldState?.error && (
                                            <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                                        )}
                                    </div>
                                </>
                            )}
                        />
                    </GoabFormItem>
                    {isTablet && <div className={style['spacer']} />}
                    <GoabFormItem>
                        <MandatoryFieldLabel label="Confirm your email"></MandatoryFieldLabel>
                        <Controller
                            name="confirmEmail"
                            control={control}
                            rules={{
                                required: 'Confirm your email',
                                validate: (value) =>
                                    value === control._formValues.email ||
                                    'You email confirmation must match your email',
                            }}
                            render={({ field, fieldState }) => (
                                <>
                                    <div>
                                        <input
                                            aria-label="Confirm your email"
                                            name={field.name}
                                            style={{
                                                width:
                                                    windowWidth > 1024
                                                        ? '21.86rem'
                                                        : windowWidth < 624
                                                          ? 'calc(21.86rem)'
                                                          : 'calc(45rem)',
                                                height: '2.625rem',
                                                border: '1px solid ' + (fieldState?.error ? 'red' : 'black'),
                                                borderRadius: '5px',
                                            }}
                                            className={fieldState?.error ? 'input-error' : ''}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            value={field.value}
                                            data-testid="confirm-email"
                                        />
                                        {fieldState?.error && (
                                            <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                                        )}
                                    </div>
                                    {/* <div className={`${isTablet ? style['tablet-background'] : ''}`}>
                                        <GoabInput
                                            ariaLabel="Confirm your email"
                                            name={field.name}
                                            width={!isTablet ? '21.86rem' : 'calc(45rem)'}
                                            error={!!fieldState?.error}
                                            onChange={({ value }) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value}
                                            testId="confirm-email"
                                        />
                                        {fieldState?.error && (
                                            <WarningIndicator message={fieldState.error.message}></WarningIndicator>
                                        )}
                                    </div> */}
                                </>
                            )}
                        />
                    </GoabFormItem>
                </div>
            </div>
        </>
    );
};

export default Step2;
