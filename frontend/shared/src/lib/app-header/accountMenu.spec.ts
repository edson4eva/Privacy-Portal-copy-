import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

/**
 * The account menu in the header holds Sign out when signed in, and the
 * header holds Sign in when not. Both are anchors slotted into the design
 * system's header, and the component forces their colour:
 *
 *     ::slotted(a.interactive) { color: ...text-link-item !important }
 *
 * It also paints the current item in the menu with the same interactive blue
 * as a background, also !important. Blue on blue leaves a solid bar with the
 * words invisible inside it, which is what the menu showed once the app's
 * overrides of those two background tokens were removed.
 *
 * The !important on the slotted rule beats the text token meant for it, so
 * the background is the only thing that can give. These check it does.
 */
const root = (): string => {
    let dir = __dirname;
    while (!existsSync(join(dir, 'node_modules', '@abgov'))) {
        const parent = dirname(dir);
        if (parent === dir) throw new Error('could not locate the frontend root');
        dir = parent;
    }
    return dir;
};

const overrides = (): string =>
    readFileSync(join(root(), 'shared/src/style/overrides.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('the account menu keeps its links readable', () => {
    it('does not paint the current menu item in the colour of its own text', () => {
        const declared = /--goa-app-header-color-bg-nav-item-in-menu-current\s*:\s*([^;]+);/.exec(overrides());

        expect(declared).not.toBeNull();
        expect(declared?.[1].trim()).toBe('transparent');
    });

    it('tints that item on hover rather than filling it', () => {
        const declared = /--goa-app-header-color-bg-nav-item-in-menu-current-hover\s*:\s*([^;]+);/.exec(overrides());

        expect(declared?.[1].trim()).toBe('var(--goa-color-info-background)');
    });

    it('states those backgrounds as colours, not as unset', () => {
        // `unset` is not a colour: the declaration using it is invalid and the
        // background falls back to none. That is how this worked before, and
        // it is indistinguishable from a typo.
        const text = overrides();
        for (const token of [
            '--goa-app-header-color-bg-nav-item-in-menu-current',
            '--goa-app-header-color-bg-nav-item-in-menu-current-hover',
        ]) {
            expect(new RegExp(`${token}\\s*:\\s*unset`).test(text)).toBe(false);
        }
    });

    it('offers a way in and a way out of the account', () => {
        const header = readFileSync(join(root(), 'shared/src/lib/app-header/AppHeader.tsx'), 'utf8');

        expect(header).toMatch(/Sign in/);
        expect(header).toMatch(/Sign out/);
        expect(header).toMatch(/SHARED_ROUTES\.signin/);
        expect(header).toMatch(/SHARED_ROUTES\.signout/);
    });
});
