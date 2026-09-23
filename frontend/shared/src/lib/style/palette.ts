/**
 * Concrete colour values for the few places a CSS custom property cannot
 * reach: attributes consumed inside a web component's shadow DOM, such as
 * GoabIcon's fillColor, and third-party editor configuration.
 *
 * Every value here mirrors a design system token, named beside it. They are
 * not a second palette: palette.spec.ts reads the design system's own tokens
 * and fails if any of these has drifted from the token it mirrors, so the
 * duplication cannot go stale unnoticed.
 *
 * Anywhere ordinary CSS will do, use the token itself.
 */
export const PALETTE = {
    /** --goa-color-interactive-default */
    interactive: '#0070c4',
    /** --goa-color-interactive-error */
    error: '#ec040b',
    /** --goa-color-success-default */
    success: '#006f4c',
    /** --goa-color-info-default */
    info: '#004a8f',
} as const;

/** The token each value mirrors, for the check that they still agree. */
export const PALETTE_TOKENS: Record<keyof typeof PALETTE, string> = {
    interactive: '--goa-color-interactive-default',
    error: '--goa-color-interactive-error',
    success: '--goa-color-success-default',
    info: '--goa-color-info-default',
};
