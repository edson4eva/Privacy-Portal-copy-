/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control } from 'react-hook-form';
import style from './Step4.module.scss';
import { GoabButton, GoabIcon } from '@abgov/react-components';
import React from 'react';
import departments from 'shared/src/lib/models/department-code';
import PpContainer from 'shared/src/lib/pp-container/PpContainer';
import { formatComplaintDateSubmissionString, formatFileSize, getformattedDateText } from 'shared/src/lib/utils/helper';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import { privacyComplaintConcernList } from '../../../../types/ComplaintForm';
import PpExpandableContainer from 'shared/src/lib/pp-expandable-container/PpExpandableContainer';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';

interface Step4Property {
    goToStep: (value: number) => void;
    isComplaintSubmitted: boolean;
    control: Control<any>;
    createdDate?: Date;
}

const Step4: React.FC<Step4Property> = ({
    goToStep,
    isComplaintSubmitted,
    control,
    createdDate,
}): React.ReactElement => {
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const navigate = useNavigate();
    const windowWidth = useWindowWidth();

    const department = departments.find((department) => department.key === control._formValues.department)?.value;
    const service = control._formValues.service;
    const circumstances = control._formValues.circumstances;
    const concern = privacyComplaintConcernList.find((issue) => issue.value === control._formValues.concern);
    const formattedConcern = concern ? `${concern.label} : ${concern.description}` : '';

    const firstName = control._formValues.firstName;
    const lastName = control._formValues.lastName;
    const email = control._formValues.email;
    const documents = control._formValues.documents;
    const documentation = control._formValues.documents.documentation;
    const onClickEditStep = (step: number) => {
        goToStep(step);
    };

    const goToMyAccount = () => {
        if (user?.isAuthenticated) {
            navigate('/account/personal');
        }
    };

    const goToComplaintHistory = () => {
        if (user?.isAuthenticated) {
            navigate('/complaint-history');
        }
    };

    return (
        <div className={style['step4']}>
            {windowWidth < 624 && (
                <>
                    <PageTitle title="FILE A COMPLAINT" fontColor="var(--goa-color-info-default)" />
                    <PpSpacer vSpacing={'s'}></PpSpacer>
                    <PageSubTitle subTitle="Review and submit" />
                    <PpSpacer vSpacing="s"></PpSpacer>
                </>
            )}
            {windowWidth > 624 && <PpSpacer vSpacing="xl"></PpSpacer>}
            {isComplaintSubmitted && (
                <>
                    <div className={style['success-callout']}>
                        <PpContainer containerBoxShadow="none" containerBorderColor="#006F4C">
                            <div className="success-container-heading">
                                <GoabIcon
                                    type="checkmark-circle"
                                    size="small"
                                    opacity={1}
                                    fillColor="#006F4C"
                                ></GoabIcon>
                                <span className={style['section-heading-value']} style={{ marginLeft: '8px' }}>
                                    Complaint submitted successfully
                                </span>
                            </div>
                            <PpSpacer vSpacing="m"></PpSpacer>
                            <div>
                                <div className={style['success-internal-container']}>
                                    Your complaint has been successfully submitted on{' '}
                                    {formatComplaintDateSubmissionString(createdDate)}. A confirmation email has been
                                    sent to your email.
                                </div>
                                <PpSpacer vSpacing="m"></PpSpacer>
                                <div className={style['internal-container']}>
                                    Privacy Services will contact you if more information is needed and to inform you of
                                    the next steps.
                                </div>
                            </div>
                        </PpContainer>
                    </div>
                    {user?.isAuthenticated && (
                        <div style={{ marginTop: '2rem', display: 'grid', gap: '8px' }}>
                            <div className={style['button-container']}>
                                <GoabButton
                                    type="secondary"
                                    leadingIcon="arrow-back"
                                    onClick={goToMyAccount}
                                    testId="back-to-account-button"
                                >
                                    Back to my account
                                </GoabButton>
                            </div>
                            <GoabButton onClick={goToComplaintHistory} testId="view-complaint-button">
                                View complaint history
                            </GoabButton>
                        </div>
                    )}
                </>
            )}
            {!isComplaintSubmitted && (
                <>
                    Please review the information entered and ensure it is accurate before submitting.
                    <PpSpacer vSpacing="m"></PpSpacer>
                    <div className={style['custom-pp-container-1']}>
                        <PpContainer>
                            <div className={style['info-container']}>
                                <div className={style['header']}>
                                    <div className={style['section-heading-label']}>Select department</div>
                                    <div data-testid="complaint-go-to-step-one-button">
                                        <GoabButton
                                            type="tertiary"
                                            size="compact"
                                            variant="normal"
                                            leadingIcon="pencil"
                                            onClick={() => onClickEditStep(1)}
                                            testId="complaint-go-to-step-one-button"
                                        >
                                            {windowWidth > 623 && <span>Edit</span>}
                                        </GoabButton>
                                    </div>
                                </div>
                                <PpSpacer vSpacing="m"></PpSpacer>
                                <div className={style['internal-container']}>
                                    <div className={style['heading-label']}>Department</div>
                                    <div className={style['heading-value']} data-testid="department-step4-value">
                                        {department}
                                    </div>
                                </div>
                                {service && (
                                    <>
                                        <PpSpacer vSpacing="m"></PpSpacer>
                                        <div className={style['internal-container']}>
                                            <div className={style['heading-label']}>Service</div>
                                            <div className={style['heading-value']} data-testid="service-step4-value">
                                                <PpExpandableContainer text={service}></PpExpandableContainer>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </PpContainer>
                    </div>
                    <PpSpacer vSpacing="l"></PpSpacer>
                    <div className={style['custom-pp-container-2']}>
                        <PpContainer>
                            <div className={style['info-container']}>
                                <div className={style['header']}>
                                    <div className={style['section-heading-label']}>Provide details</div>
                                    <div data-testid="complaint-go-to-step-two-button">
                                        <GoabButton
                                            type="tertiary"
                                            size="compact"
                                            variant="normal"
                                            leadingIcon="pencil"
                                            onClick={() => onClickEditStep(2)}
                                            testId="complaint-go-to-step-two-button"
                                        >
                                            {windowWidth > 623 && <span>Edit</span>}
                                        </GoabButton>
                                    </div>
                                </div>
                                <PpSpacer vSpacing="m"></PpSpacer>
                                <div className={style['internal-container']}>
                                    <div className={style['heading-label']}>Privacy concern</div>
                                    <div className={style['heading-value']} data-testid="privacy-concern-step4-value">
                                        {formattedConcern}
                                    </div>
                                </div>
                                <PpSpacer vSpacing="m"></PpSpacer>
                                <div className={style['internal-container']}>
                                    <div className={style['heading-label']}>Describe circumstances</div>
                                    <div
                                        className={style['heading-value']}
                                        data-testid="describe-circumstance-step4-value"
                                    >
                                        <PpExpandableContainer text={circumstances}></PpExpandableContainer>
                                    </div>
                                </div>
                                <PpSpacer vSpacing="xl"></PpSpacer>
                                <div className={style['section-heading-value']}>Contact Information</div>
                                <PpSpacer vSpacing="m"></PpSpacer>
                                <div className={style['internal-container']}>
                                    <div className={style['heading-label']}>First name</div>
                                    <div className={style['heading-value']} data-testid="first-name-step4-value">
                                        {firstName}
                                    </div>
                                </div>
                                <PpSpacer vSpacing="m"></PpSpacer>
                                <div className={style['internal-container']}>
                                    <div className={style['heading-label']}>Last name</div>
                                    <div className={style['heading-value']} data-testid="last-name-step4-value">
                                        {lastName}
                                    </div>
                                </div>
                                <PpSpacer vSpacing="m"></PpSpacer>
                                <div className={style['internal-container']}>
                                    <div className={style['heading-label']}>Email</div>
                                    <div className={style['heading-value']} data-testid="email-step4-value">
                                        {email}
                                    </div>
                                </div>
                            </div>
                        </PpContainer>
                    </div>
                    <PpSpacer vSpacing="l"></PpSpacer>
                    <div className={style['custom-pp-container-3']}>
                        <PpContainer>
                            <div className={style['info-container']}>
                                <div className={style['header']}>
                                    <div className={style['section-heading-label']}>Attach documentation</div>
                                    <div data-testid="complaint-go-to-step-three-button">
                                        <GoabButton
                                            type="tertiary"
                                            size="compact"
                                            variant="normal"
                                            leadingIcon="pencil"
                                            onClick={() => onClickEditStep(3)}
                                            testId="complaint-go-to-step-three-button"
                                        >
                                            {windowWidth > 623 && <span>Edit</span>}
                                        </GoabButton>
                                    </div>
                                </div>
                                {documents?.files?.length > 0 && (
                                    <>
                                        <PpSpacer vSpacing="m"></PpSpacer>
                                        <div className={style['internal-container']}>
                                            <div className={style['heading-label']}>Uploaded files</div>
                                            <div className={style['heading-value']}>
                                                {documents?.files?.map((file: any) => (
                                                    <div key={file?.fileName} style={{ marginBottom: '1em' }}>
                                                        <div>{file?.fileName}</div>
                                                        <div>{formatFileSize(file.fileSize)}</div>
                                                        <div>{getformattedDateText()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <PpSpacer vSpacing="m"></PpSpacer>
                                        <div className={style['internal-container']}>
                                            <div className={style['heading-label']}>Document description</div>
                                            <div className={style['heading-value']}>
                                                <PpExpandableContainer text={documentation}></PpExpandableContainer>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {documents?.files?.length === 0 && (
                                    <div className={style['information-callout']}>
                                        <PpContainer containerBoxShadow="none" containerBorderColor="#0070C4">
                                            <div className="information-container-heading">
                                                <GoabIcon
                                                    type="information-circle"
                                                    size="small"
                                                    opacity={1}
                                                    fillColor="#0070C4"
                                                ></GoabIcon>
                                                <span
                                                    className={style['heading-label-value']}
                                                    style={{ marginLeft: '8px' }}
                                                    data-testid="no-attachments-step4-value"
                                                >
                                                    No attachments provided
                                                </span>
                                            </div>
                                        </PpContainer>
                                    </div>
                                )}
                            </div>
                        </PpContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default Step4;
