/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable unicorn/prevent-abbreviations */
export type PpFormStepStatusType = 'complete' | 'incomplete';

interface WCProps {
    text: string;
    status?: PpFormStepStatusType;
}

declare global {
    namespace React.JSX {
        interface IntrinsicElements {
            'goax-form-step': WCProps & React.HTMLAttributes<HTMLElement>;
        }
    }
}

export interface GoAFormStepProps {
    text: string;
    status?: PpFormStepStatusType;
}

export function PpFormStep(props: GoAFormStepProps) {
    return <goax-form-step text={props.text} status={props.status} />;
}

export default PpFormStep;
