import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

/**
 * A stylesheet that names a token the design system does not define fails
 * silently: the custom property is invalid, the declaration using it is
 * dropped, and whatever the browser falls back to is what a user sees.
 *
 * That is how --goa-color-information-default survived in the callout
 * overrides. It was never exercised until the app rendered its first callout,
 * and then it showed up as an unreadable icon on a coloured block. This reads
 * every stylesheet the app ships and fails on any such reference.
 */
const repoRoot = (): string => {
    let dir = __dirname;
    while (!existsSync(join(dir, 'node_modules', '@abgov'))) {
        const parent = dirname(dir);
        if (parent === dir) throw new Error('could not locate the frontend root');
        dir = parent;
    }
    return dir;
};

/**
 * The reference for what a token is and what it holds.
 *
 * It is @abgov/web-components/index.css and NOT @abgov/design-tokens, because
 * that is the stylesheet the apps actually import - see each app's
 * src/styles.css. The components ship their own copy of the definitions, and
 * it does not always match the design-tokens package: web-components 2.5.0
 * puts --goa-color-greyscale-black at #333333 where design-tokens 2.12.8 puts
 * it at #000000. Checking against design-tokens would pass tokens that are
 * undefined in the browser and fail values that are correct there.
 */
const tokenSource = (root: string): string =>
    readFileSync(join(root, 'node_modules/@abgov/web-components/index.css'), 'utf8');

const stylesheets = (root: string): string[] => {
    const found: string[] = [];
    const walk = (dir: string) => {
        for (const entry of readdirSync(dir)) {
            // TinyMCE ships its own editor skins; those are vendored.
            if (entry === 'node_modules' || entry === 'tinymce') continue;
            const path = join(dir, entry);
            if (statSync(path).isDirectory()) walk(path);
            else if (path.endsWith('.css') || path.endsWith('.scss')) found.push(path);
        }
    };
    for (const top of ['apps', 'shared']) {
        const path = join(root, top);
        if (existsSync(path)) walk(path);
    }
    return found;
};

describe('stylesheets name only tokens that exist', () => {
    const root = repoRoot();
    const sheets = stylesheets(root);

    const defined = new Set<string>();
    for (const text of [tokenSource(root), ...sheets.map((file) => readFileSync(file, 'utf8'))]) {
        for (const match of text.matchAll(/(--goa-[a-z0-9-]+)\s*:/g)) {
            defined.add(match[1]);
        }
    }

    it('finds the design tokens and the stylesheets that use them', () => {
        expect(defined.size).toBeGreaterThan(100);
        expect(sheets.length).toBeGreaterThan(20);
    });

    it('references no undefined --goa token', () => {
        const undefinedRefs: string[] = [];
        for (const file of sheets) {
            for (const match of readFileSync(file, 'utf8').matchAll(/var\((--goa-[a-z0-9-]+)/g)) {
                if (!defined.has(match[1])) {
                    undefinedRefs.push(`${file.slice(root.length + 1)}: ${match[1]}`);
                }
            }
        }

        expect([...new Set(undefinedRefs)]).toEqual([]);
    });
});
