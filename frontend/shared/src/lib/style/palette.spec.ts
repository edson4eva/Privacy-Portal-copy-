import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

import { PALETTE, PALETTE_TOKENS } from './palette';

/**
 * The palette exists only because some attributes cannot take a CSS variable.
 * That makes it a copy of four token values, and a copy can drift. This reads
 * the design system's own tokens and fails if any of them has moved.
 */
describe('the palette still agrees with the design system', () => {
    let tokens = '';

    beforeAll(() => {
        let dir = __dirname;
        while (!existsSync(join(dir, 'node_modules', '@abgov'))) {
            const parent = dirname(dir);
            if (parent === dir) throw new Error('could not locate the frontend root');
            dir = parent;
        }
        /*
         * The apps import @abgov/web-components/index.css, not
         * @abgov/design-tokens, and the two do not always agree: 2.5.0 of the
         * components puts greyscale-black at #333333 where design-tokens
         * 2.12.8 puts it at #000000. The palette has to mirror what the
         * browser is given, so this reads the stylesheet the apps import.
         */
        tokens = readFileSync(join(dir, 'node_modules/@abgov/web-components/index.css'), 'utf8');
    });

    it.each(Object.keys(PALETTE) as (keyof typeof PALETTE)[])('%s mirrors its token', (name) => {
        const token = PALETTE_TOKENS[name];
        const declared = new RegExp(`${token}:\\s*(#[0-9a-fA-F]{3,6})`).exec(tokens);

        expect(declared).not.toBeNull();
        expect(PALETTE[name].toLowerCase()).toEqual(declared?.[1].toLowerCase());
    });
});
