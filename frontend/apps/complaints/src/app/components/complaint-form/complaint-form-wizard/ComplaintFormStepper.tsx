/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unicorn/prevent-abbreviations */

import { useEffect, useState } from 'react';
import { GoabButton, GoabButtonGroup, GoabIcon, GoabPages } from '@abgov/react-components';
import { PpFormStepper } from 'shared/src/lib/pp-form-stepper';
import PpFormStep, { PpFormStepStatusType } from 'shared/src/lib/pp-form-stepper/PpFormStep/PpFormStep';
import Step1 from './step1/Step1';
import Step2 from './step2/Step2';
import Step3 from './step3/Step3';
import Step4 from './step4/Step4';
import { createComplaint } from 'shared/src/lib/api/createComplaintService';
import {
    getConcernLabelText,
    getSchemaForStep,
    tranformComplaintData,
    validateComplaintData,
} from '../../../types/ComplaintForm';
import { useForm } from 'react-hook-form';
import { getDownloadSasToken } from 'shared/src/lib/api/azureBlobService';
import { sendNewComplaintEmail } from 'shared/src/lib/api/emailService';
import style from './ComplaintFormStepper.module.scss';
import departments from 'shared/src/lib/models/department-code';
import ErrorPage from 'shared/src/lib/error-page/ErrorPage';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import ScrollToTop from 'shared/src/lib/scroll-to-top/ScrollToTop';
import { trackEvent } from 'shared/src/lib/api/tagManagerService';
import PpContainer from 'shared/src/lib/pp-container/PpContainer';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import { generateCorrelationId } from 'shared/src/lib/utils/correlationId';

interface ComplaintFormStepperProperties {
    onBack: () => void;
}

const ComplaintFormStepper = ({ onBack }: ComplaintFormStepperProperties): React.ReactElement => {
    const [isComplaintSubmitted, setIsComplaintSubmitted] = useState<boolean>(false);
    const windowWidth = useWindowWidth();
    const [unexpectedError, setUnexpectedError] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const { isAuthenticated, getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const [createdDate, setCreatedDate] = useState<Date>();
    const navigate = useNavigate();
    const [correlationId] = useState(generateCorrelationId());

    const [step, setStep] = useState<number>(1);
    const [status, setStatus] = useState<PpFormStepStatusType[]>([
        'incomplete',
        'incomplete',
        'incomplete',
        'incomplete',
        'incomplete',
    ]);

    const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
    const currentSchema = getSchemaForStep(step);
    const {
        formState: { errors },
        control,
        trigger,
    } = useForm({
        resolver: yupResolver(currentSchema),
        defaultValues: {
            documents: {
                files: [],
                documentation: '',
            },
        },
    });

    const extractBlobName = (url: string): string => {
        const urlSegments = url.split('/');
        return urlSegments[urlSegments.length - 1];
    };

    useEffect(() => {
        const generateDownloadLinks = async () => {
            const files: any[] = control._formValues?.documents?.files || [];
            const documentUrls = files.map((file) => file.url);

            if (documentUrls && documentUrls.length > 0) {
                const links = await Promise.all(
                    documentUrls.map(async (url) => {
                        const urlWithoutParams = url.split('?');
                        const blobName = extractBlobName(urlWithoutParams[0]);
                        const sasTokenUrl = await getDownloadSasToken(blobName, correlationId);
                        return sasTokenUrl;
                    })
                );
                setDownloadLinks(links);
            } else {
                setDownloadLinks([]);
            }
        };

        if (step === 4) {
            generateDownloadLinks();
        }
    }, [step, control._formValues?.documents?.files, correlationId]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    const setPage = (page: number) => {
        if (page < 1 || page > 5) return;
        setStep(page);
    };

    const handleNext = async () => {
        switch (step) {
            case 1:
                // these object properties are in snake_case. Do not change them to camelCase. This is how the GA event has been set up.
                trackEvent({
                    action: 'pp_select_dept_next_btn_click',
                    category: 'pp_complaint_process',
                    label: 'pp_comp_process_selectdept_next',
                });
                break;
            case 2:
                // these object properties are in snake_case. Do not change them to camelCase. This is how the GA event has been set up.
                trackEvent({
                    action: 'pp_provide_details_next_btn_click',
                    category: 'pp_complaint_process',
                    label: 'pp_comp_process_provdetails_next',
                });
                break;
            case 3:
                // these object properties are in snake_case. Do not change them to camelCase. This is how the GA event has been set up.
                trackEvent({
                    action: 'pp_attach_docs_next_btn_click',
                    category: 'pp_complaint_process',
                    label: 'pp_comp_process_attachdocs_next',
                });
                break;
        }
        const isValid = await trigger();
        if (isValid) {
            updateStatus(step - 1, 'complete');
            setPage(step + 1);
        }
        (document.activeElement as HTMLElement)?.blur();
    };
    const handleBack = () => {
        if (step === 1) {
            setShowModal(true);
        }
        updateStatus(step, 'incomplete');
        setPage(step - 1);
        (document.activeElement as HTMLElement)?.blur();
    };
    const updateStatus = (index: number, newStatus: PpFormStepStatusType) => {
        setStatus((prevStatus) => prevStatus.map((status, i) => (i === index ? newStatus : status)));
    };
    const handleSubmit = async () => {
        // these object properties are in snake_case. Do not change them to camelCase. This is how the GA event has been set up.
        trackEvent({
            action: 'pp_complaint_submit_btn_click',
            category: 'pp_complaint_process',
            label: 'pp_comp_process_complaint_submit',
        });
        const formValues = control._formValues;
        const departmentKey = formValues.department;
        const department = departments.find((department) => department.key === departmentKey)?.value || '';

        if (await validateComplaintData(formValues)) {
            const finalData = {
                ...formValues,
                downloadLinks,
            };

            let documentLinks = '';
            if (downloadLinks && downloadLinks.length > 0) {
                documentLinks = downloadLinks.map((link, i) => `Link ${i + 1}: ${link}`).join('\n\n ');
            }

            let documentDescription = 'No files uploaded';
            if ((downloadLinks && downloadLinks.length > 0) || formValues.documents.documentation) {
                documentDescription = formValues.documents.documentation;
            }

            let userStatus = '';
            if (!user || user.profile === 'guest') {
                userStatus = 'Guest user';
            } else if (isAuthenticated && user?.isVerified) {
                userStatus = 'Verified user';
            } else if (isAuthenticated && !user?.isVerified) {
                userStatus = 'Basic user';
            }

            const personalisation = {
                Department: department,
                ServiceName: formValues.service ? formValues.service : '',
                PrivacyConcern: getConcernLabelText(formValues.concern),
                Circumstances: formValues.circumstances,
                EmployeeName: formValues.employeeName ? formValues.employeeName : '',
                FirstName: formValues.firstName,
                LastName: formValues.lastName,
                UserEmail: formValues.email,
                DocumentLinks: documentLinks,
                DocumentDescription: documentDescription,
                DateOfSubmission: new Date().toLocaleDateString(),
                TimeOfSubmission: new Date().toLocaleTimeString(),
                AccountType: userStatus,
            };

            const payload = { Personalisation: personalisation };

            let errorMessage = '';
            try {
                const response = await createComplaint(tranformComplaintData(finalData), correlationId);
                if (response.success) {
                    setIsComplaintSubmitted(true);
                    setCreatedDate(response?.createdDate ? new Date(response.createdDate) : undefined);
                    try {
                        const emailResponse = await sendNewComplaintEmail(payload, correlationId);
                        if (!emailResponse.success) {
                            errorMessage = emailResponse.message;
                        }
                    } catch (emailError) {
                        console.error('Failed to send email.', emailError);
                        errorMessage = 'Failed to send email';
                    }
                    updateStatus(step - 1, 'complete');
                    setPage(step + 1);
                }
            } catch (error) {
                console.error('Error creating complaint:', error);
                errorMessage = 'Unexpected error occurred while creating complaint.';
            }
        }
    };

    const goToStep = (step: number) => {
        setStep(step);
    };

    useEffect(() => {
        if (!isComplaintSubmitted) {
            const handleBeforeUnload = (event: any) => {
                if (!isReloading) {
                    event.preventDefault();
                    delete event.returnValue;
                }
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, [isComplaintSubmitted, isReloading]);

    useEffect(() => {
        if (!isComplaintSubmitted) {
            const handlePopState = () => {
                const userConfirmed = window.confirm(
                    'If you leave this page, changes made will be lost. Would you like to proceed?'
                );

                if (!userConfirmed) {
                    navigate(window.location.pathname, { replace: true });
                }
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isComplaintSubmitted, navigate]);
    return (
        <>
            <ScrollToTop />
            <div className={style['stepper-container']}>
                {windowWidth > 623 && <PpSpacer vSpacing="xl"></PpSpacer>}
                <PpFormStepper step={step} onChange={setStep} mobile={windowWidth < 623} backgroundColor={'#F3F3F3'}>
                    <PpFormStep text="Select department" status={status[0]} />
                    <PpFormStep text="Provide details" status={status[1]} />
                    <PpFormStep text="Attach documentation" status={status[2]} />
                    <PpFormStep text="Review and submit" status={status[3]} />
                    <div style={{ display: 'none' }}>
                        <PpFormStep text="Review and submit" status={status[4]} />
                    </div>
                </PpFormStepper>
                {!unexpectedError && (
                    <GoabPages current={step} mb="xl">
                        <div>
                            <Step1 control={control} correlationId={correlationId} />
                        </div>
                        <div>
                            <Step2 control={control} editPreviousStep={() => goToStep(1)} />
                        </div>
                        <div>
                            <Step3 control={control} />
                        </div>
                        <div>
                            <Step4
                                control={control}
                                goToStep={(e) => goToStep(e)}
                                isComplaintSubmitted={isComplaintSubmitted}
                                createdDate={createdDate}
                            />
                        </div>
                        <div>
                            <Step4
                                control={control}
                                goToStep={(e) => goToStep(e)}
                                isComplaintSubmitted={isComplaintSubmitted}
                                createdDate={createdDate}
                            />
                        </div>
                    </GoabPages>
                )}
                {!isComplaintSubmitted && !unexpectedError ? (
                    <div className={style['navigation-buttons']}>
                        <GoabButton
                            type="secondary"
                            leadingIcon="arrow-back"
                            onClick={handleBack}
                            testId="complaint-navigation-back-button"
                        >
                            Back
                        </GoabButton>
                        <PpSpacer vSpacing={'m'} />
                        {step < 4 ? (
                            <GoabButton
                                type="primary"
                                trailingIcon="arrow-forward"
                                onClick={handleNext}
                                testId="complaint-navigation-next-button"
                            >
                                Next
                            </GoabButton>
                        ) : (
                            <GoabButton
                                type="primary"
                                onClick={handleSubmit}
                                testId="complaint-navigation-submit-button"
                            >
                                Submit
                            </GoabButton>
                        )}
                    </div>
                ) : (
                    <></>
                )}
                {unexpectedError && (
                    <div className={style['error-page']}>
                        <ErrorPage></ErrorPage>
                        <div>
                            <GoabButton mt="m" mb="xl" type="primary" onClick={() => window.location.reload()}>
                                Reload
                            </GoabButton>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className={style['modal']}>
                    <PpContainer containerBoxShadow="none">
                        <div className={style['modal-heading']}>
                            <div className={style['yellow-circle']}>
                                <GoabIcon type="alert-circle" theme="outline" opacity={1}></GoabIcon>
                            </div>
                            <h3>&nbsp;Unsaved changes</h3>
                        </div>
                        <p>If you leave this page, changes made will be lost. Would you like to proceed?</p>
                        <GoabButtonGroup alignment="end" mt="xl">
                            <GoabButton type="secondary" testId="modal-button-leave" onClick={() => onBack()}>
                                Leave
                            </GoabButton>
                            <GoabButton type="primary" testId="modal-button-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </GoabButton>
                        </GoabButtonGroup>
                    </PpContainer>
                </div>
            )}
        </>
    );
};

export default ComplaintFormStepper;
