import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

/**
 * The app is built on the GoA design system, so its stylesheets should state
 * tokens rather than colours, type sizes and spacings of their own. These
 * checks read every stylesheet the app ships and fail on a value that has
 * drifted off the system.
 *
 * Two sets of files are exempt, for reasons rather than convenience:
 *
 * - AlbertaWalletPage.module.scss draws facsimiles of printed government
 *   documents - a driver's licence, a health card. Their colours and type
 *   sizes belong to those documents, which the design system does not cover.
 *   The QR frames and the card shadows are part of the same drawing.
 * - The TinyMCE editor skins under assets/tinymce are vendored third-party
 *   files, not ours to restyle.
 */
const FACSIMILE = 'AlbertaWalletPage.module.scss';
const VENDORED = 'assets/tinymce';

const repoRoot = (): string => {
    let dir = __dirname;
    while (!existsSync(join(dir, 'node_modules', '@abgov'))) {
        const parent = dirname(dir);
        if (parent === dir) throw new Error('could not locate the frontend root');
        dir = parent;
    }
    return dir;
};

const root = repoRoot();

const stylesheets = (): { name: string; path: string; text: string }[] => {
    const found: { name: string; path: string; text: string }[] = [];
    const walk = (dir: string) => {
        for (const entry of readdirSync(dir)) {
            if (entry === 'node_modules') continue;
            const path = join(dir, entry);
            if (path.includes(VENDORED)) continue;
            if (statSync(path).isDirectory()) walk(path);
            else if (/\.s?css$/.test(path) && !path.endsWith(FACSIMILE)) {
                found.push({ name: path.slice(root.length + 1), path, text: readFileSync(path, 'utf8') });
            }
        }
    };
    for (const top of ['apps', 'shared']) walk(join(root, top));
    return found;
};

/** Declarations, with comments and custom property definitions dropped. */
const declarations = (text: string): string[] =>
    text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('--') && !line.startsWith('//'));

const sheets = stylesheets();

describe('stylesheets follow the design system', () => {
    it('reads the app stylesheets', () => {
        expect(sheets.length).toBeGreaterThan(50);
    });

    it('states no literal colour outside the document facsimiles', () => {
        const offenders: string[] = [];
        for (const sheet of sheets) {
            for (const line of declarations(sheet.text)) {
                // Shadows carry an alpha the palette has no token for.
                if (/box-shadow|text-shadow|--goa-[a-z-]*shadow/.test(line)) continue;
                if (/#[0-9a-fA-F]{3,6}\b|\brgba?\(|\bhsla?\(/.test(line)) {
                    offenders.push(`${sheet.name}: ${line}`);
                }
            }
        }
        expect(offenders).toEqual([]);
    });

    it('takes font weight and face from tokens', () => {
        const offenders: string[] = [];
        for (const sheet of sheets) {
            for (const line of declarations(sheet.text)) {
                if (/font-weight:(?!\s*var\()/.test(line)) offenders.push(`${sheet.name}: ${line}`);
                if (/font-family:(?!\s*var\()/.test(line)) offenders.push(`${sheet.name}: ${line}`);
            }
        }
        expect(offenders).toEqual([]);
    });

    it('does not track text by hand, since the type tokens do not', () => {
        const offenders: string[] = [];
        for (const sheet of sheets) {
            for (const line of declarations(sheet.text)) {
                if (/(letter|word)-spacing:/.test(line)) offenders.push(`${sheet.name}: ${line}`);
            }
        }
        expect(offenders).toEqual([]);
    });

    it('never states "none" where a colour is wanted', () => {
        /*
         * "none" is a valid background *image* value and not a valid
         * background *colour*, so a colour property set to none is thrown
         * away and whatever the default is shows through instead. Four
         * callout colours were set this way, which is how a status bar meant
         * to be invisible stayed a solid block. "transparent" is the value
         * that means it.
         */
        const offenders: string[] = [];
        for (const sheet of sheets) {
            for (const line of sheet.text.split('\n').map((l) => l.trim())) {
                if (
                    /^--[a-z-]*colo(?:u)?r[a-z-]*:\s*none\s*;/.test(line) ||
                    /^--[a-z-]*-bg-[a-z-]*:\s*none\s*;/.test(line)
                ) {
                    offenders.push(`${sheet.name}: ${line}`);
                }
                if (/^(?:background-color|color|border-color|outline-color|fill|stroke):\s*none\s*;/.test(line)) {
                    offenders.push(`${sheet.name}: ${line}`);
                }
            }
        }
        expect(offenders).toEqual([]);
    });

    it('takes line height from tokens', () => {
        const offenders: string[] = [];
        for (const sheet of sheets) {
            for (const line of declarations(sheet.text)) {
                if (/line-height:\s*[\d.]/.test(line)) offenders.push(`${sheet.name}: ${line}`);
            }
        }
        expect(offenders).toEqual([]);
    });
});

describe('components follow the design system', () => {
    const components = (): { name: string; text: string }[] => {
        const found: { name: string; text: string }[] = [];
        const walk = (dir: string) => {
            for (const entry of readdirSync(dir)) {
                if (entry === 'node_modules') continue;
                const path = join(dir, entry);
                if (statSync(path).isDirectory()) walk(path);
                // nx-welcome is the unrouted Nx scaffold page; the wallet
                // draws document facsimiles in SVG.
                else if (
                    path.endsWith('.tsx') &&
                    !path.endsWith('.spec.tsx') &&
                    !path.includes('nx-welcome') &&
                    !path.includes('AlbertaWalletPage')
                ) {
                    found.push({ name: path.slice(root.length + 1), text: readFileSync(path, 'utf8') });
                }
            }
        };
        for (const top of ['apps', 'shared']) walk(join(root, top));
        return found;
    };

    it('does not colour the page eyebrow from the call site', () => {
        // Pages used to pass this in, and passed two different blues for it.
        const offenders = components()
            .filter((component) => /fontColor=/.test(component.text))
            .map((component) => component.name);

        expect(offenders).toEqual([]);
    });

    it('passes no literal colour into a component through an inline style', () => {
        const offenders: string[] = [];
        for (const component of components()) {
            for (const match of component.text.matchAll(
                /[A-Za-z]*(?:color|Color|background|Background|fill|Fill|stroke|Stroke)\s*[:=]\s*["'{]?\s*['"]?(#[0-9a-fA-F]{3,6})/g
            )) {
                offenders.push(`${component.name}: ${match[1]}`);
            }
        }
        expect(offenders).toEqual([]);
    });
});
