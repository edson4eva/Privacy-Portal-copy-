/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable unicorn/prevent-abbreviations */

import { Margins } from '@abgov/ui-components-common';
import { ReactNode, useEffect, useRef } from 'react';

interface WCProps extends Margins {
    ref?: React.MutableRefObject<HTMLElement | null>;
    step?: number;
    mobile?: string;
    backgroundcolor?: string;
    testid?: string;
}

declare global {
    namespace React.JSX {
        interface IntrinsicElements {
            'goax-form-stepper': WCProps & React.HTMLAttributes<HTMLElement>;
        }
    }
}

export interface PpFormStepperProps extends Margins {
    step?: number;
    mobile?: boolean;
    testId?: string;
    backgroundColor?: string;
    children?: ReactNode;
    onChange?: (step: number) => void;
}

export function PpFormStepper({
    testId,
    step,
    mobile,
    backgroundColor,
    mt,
    mb,
    ml,
    mr,
    onChange,
    children,
}: PpFormStepperProps) {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const current = ref.current;
        const changeListener = (e: unknown) => {
            const { step } = (e as CustomEvent).detail;
            onChange?.(+step);
        };

        current.addEventListener('_change', changeListener);
        return () => {
            current.removeEventListener('_change', changeListener);
        };
    }, [ref, onChange]);

    return (
        <goax-form-stepper
            ref={ref}
            mobile={mobile ? 'true' : 'false'}
            backgroundcolor={backgroundColor}
            testid={testId}
            step={step}
            mt={mt}
            mr={mr}
            mb={mb}
            ml={ml}
        >
            {children}
        </goax-form-stepper>
    );
}

export default PpFormStepper;
