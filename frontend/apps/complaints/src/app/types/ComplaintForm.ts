/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable @typescript-eslint/no-empty-interface */
import { Complaint } from 'shared/src/lib/models/complaint';
import * as Yup from 'yup';

type StepStatus = 'incomplete' | 'complete' | undefined;
interface Step {
    step: number;
    status: StepStatus;
}

const ComplaintFormStepOne = Yup.object({
    department: Yup.string().required('Select a department'),
});
const ComplaintFormStepTwo = Yup.object({
    concern: Yup.string().required('Choose one concern'),
    circumstances: Yup.string().required('Describe circumstances'),
    firstName: Yup.string()
        .required('Provide your first name')
        .matches(/^[a-zA-Z\s'-]+$/, 'Name can only include letters, spaces, hyphens, and apostrophes.'),
    lastName: Yup.string()
        .required('Provide your last name')
        .matches(/^[a-zA-Z\s'-]+$/, 'Name can only include letters, spaces, hyphens, and apostrophes.'),
    email: Yup.string().email('Write correct email format').required('Provide your email'),
    confirmEmail: Yup.string()
        .email('Write correct email format')
        .required('Confirm your email')
        .test('email-match', 'Your email confirmation must match your email', function (value) {
            const { email } = this.parent;
            return value?.toLowerCase() === email?.toLowerCase();
        }),
});

const ComplaintFormStepThree = Yup.object({
    documents: Yup.object({
        files: Yup.array()
            .of(Yup.mixed())
            .default([])
            .test('max-files', 'You cannot upload more than 5 documents', function (files) {
                if (!files || files.length === 0) return true;
                return files.length <= 5;
            }),
        documentation: Yup.string().when('files', {
            is: (files: any[]) => files && files.length > 0,
            then: () => Yup.string().required('Describe documentation'),
            otherwise: () => Yup.string().notRequired(),
        }),
    }),
});

const ComplaintFormSchema = ComplaintFormStepOne && ComplaintFormStepTwo && ComplaintFormStepThree;

const getSchemaForStep = (step: number) => {
    switch (step) {
        case 1:
            return ComplaintFormStepOne;
        case 2:
            return ComplaintFormStepTwo;
        case 3:
            return ComplaintFormStepThree;
        default:
            return Yup.object();
    }
};

export const formValuesSchema = Yup.object({
    department: Yup.string().required('Select a department'),
    service: Yup.string().optional(),
    concern: Yup.string().required('Choose one concern'),
    circumstances: Yup.string().required('Describe circumstances'),
    employeeName: Yup.string().optional(),
    confirmEmail: Yup.string().email('Write correct email format').required('Confirm your email'),
    documents: Yup.object().optional(),
    email: Yup.string().email('Write correct email format').required('Provide your email'),
    firstName: Yup.string()
        .matches(/^[a-zA-Z\s'-]+$/, 'Name can only include letters, spaces, hyphens, and apostrophes.')
        .required('Provide your first name1'),
    lastName: Yup.string()
        .matches(/^[a-zA-Z\s'-]+$/, 'Name can only include letters, spaces, hyphens, and apostrophes.')
        .required('Provide your last name'),
});

export const validateComplaintData = async (formValues: any): Promise<boolean> => {
    try {
        await formValuesSchema.validate(formValues, { abortEarly: false });

        return true;
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            console.error('Validation errors:', error.inner);
            return false;
        }
    }
    return false;
};

export const tranformComplaintData = (formValues: any): Complaint => {
    const complaintForm: Complaint = {
        department: formValues.department,
        service: formValues.service,
        concern: privacyComplaintConcernList.find((issue) => issue.value === formValues.concern)?.label ?? '',
        circumstances: formValues.circumstances,
        employeeName: formValues.employeeName,
        complaineeContactInfo: {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            email: formValues.email,
        },
        documents: [{ documentation: formValues?.documents?.documentation, files: formValues.documents?.files }],
    };
    return complaintForm;
};
interface ComplaintFormStepOne extends Yup.InferType<typeof ComplaintFormStepOne> {}
interface ComplaintFormStepTwo extends Yup.InferType<typeof ComplaintFormStepTwo> {}
interface ComplaintFormStepThree extends Yup.InferType<typeof ComplaintFormStepThree> {}
interface ComplaintForm extends Yup.InferType<typeof ComplaintFormSchema> {}

export { ComplaintForm, ComplaintFormSchema, Step, StepStatus, getSchemaForStep };

export const getConcernLabelText = (value: string): string => {
    return privacyComplaintConcernList.find((item) => item.value === value)?.label || '';
};

export const privacyComplaintConcernList = [
    {
        value: '1',
        label: 'Unauthorized access',
        description:
            'My personal information was accessed without permission, whether intentional or accidental (including snooping).',
    },
    {
        value: '2',
        label: 'Unauthorized disclosure',
        description:
            'My personal information was shared without my consent, either intentionally or by mistake (e.g., sent to the wrong recipient via email or mail).',
    },
    {
        value: '3',
        label: 'Loss of personal information',
        description: 'My personal information was lost due to an incident (e.g., theft, fire, flood).',
    },
    {
        value: '4',
        label: 'Inaccurate information',
        description: 'My personal information is incorrect.',
    },
    {
        value: '5',
        label: 'Overcollection',
        description: 'More personal information was collected than necessary.',
    },
    {
        value: '6',
        label: 'Security breach',
        description:
            'My personal information was compromised due to hacking, phishing, theft (e.g., stolen laptop, office break-in), or weak security measures.',
    },
    {
        value: '7',
        label: 'Other',
        description: 'Please specify details in the next question.',
    },
];
