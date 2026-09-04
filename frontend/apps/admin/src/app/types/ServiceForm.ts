 
 
/* eslint-disable @typescript-eslint/no-empty-interface */
import { ServiceDetailDto } from './ServiceDetailDto';
import * as Yup from 'yup';

const ServiceFormSchema = Yup.object({
    serviceName: Yup.string().trim().required('Service name is required'),
    description: Yup.string().trim().required('Service description is required'),
    categoryId: Yup.string().required('Category is required'),
    dataOwnerIds: Yup.array().of(Yup.string())
        .min(1, 'Select ministry and data owner')
        .max(5, 'Select a maximum of 5'),
    accessServiceUrl: Yup.string().trim().required('Service access link is required'),
    origin: Yup.string().required('Service origin is required'),
    rpId: Yup.string().test('rpId-required-if-origin-UIAM', 'RP ID Prod is required', function (value) {
        const { origin } = this.parent;
        return origin !== 'UIAM' || (origin === 'UIAM' && !!value);
    }),
    rpIdForUAT: Yup.string().test('rpIdForUAT-required-if-origin-UIAM', 'RP ID UAT is required', function (value) {
        const { origin } = this.parent;
        return origin !== 'UIAM' || (origin === 'UIAM' && !!value);
    }),
    sku: Yup.string().test('sku-required-if-origin-eServices', 'Sku  is required', function (value) {
        const { origin } = this.parent;
        return origin !== 'eServices' || (origin === 'eServices' && !!value);
    }),
    showMockInDev: Yup.boolean().required('This selection is required.'),
    isAvailable: Yup.boolean().required('This selection is required.'),
});

export const validateServiceData = async (formValues: ServiceDetailDto): Promise<boolean | Yup.ValidationError[]> => {
    try {
        await ServiceFormSchema.validate(formValues, { abortEarly: false });
        return true;
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            return error.inner;
        }
        return [];
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ServiceForm extends Yup.InferType<typeof ServiceFormSchema> {}

export { ServiceForm, ServiceFormSchema };
