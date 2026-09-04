/**
 * Demo mode lets the app run without its backend services, UIAM authentication
 * or Azure dependencies, so the complaint flow can be exercised end to end in
 * an isolated environment (for example the NEXUS sandbox).
 *
 * It is opt-in and off unless NX_PUBLIC_DEMO_MODE is exactly 'true', so a
 * normal build for dev/syst/uat/prod is unaffected.
 *
 * Never enable this where real complaints are filed: submissions are
 * acknowledged in the UI but discarded, never persisted or emailed.
 */
export const isDemoMode = (): boolean => process.env.NX_PUBLIC_DEMO_MODE === 'true';
