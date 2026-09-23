import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * These pages are meant to answer to the GoA design system rather than to
 * colours and type sizes chosen here, so the stylesheet is checked for the
 * things that would mean it had drifted back: a literal colour, a raw font
 * weight, or a font stack of its own.
 */
describe('citizen-facing stylesheets follow the design system', () => {
    const stylesheets = readdirSync(__dirname)
        .filter((name) => name.endsWith('.module.scss'))
        .map((name) => [name, readFileSync(join(__dirname, name), 'utf8')] as const);

    it('has stylesheets to check', () => {
        expect(stylesheets.length).toBeGreaterThan(0);
    });

    it.each(stylesheets)('%s states no literal colour', (_name, content) => {
        expect(content).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
        expect(content).not.toMatch(/\b(rgb|rgba|hsl)\(/);
    });

    it.each(stylesheets)('%s takes weight, size and face from tokens', (_name, content) => {
        expect(content).not.toMatch(/font-weight:\s*\d/);
        expect(content).not.toMatch(/font-size:\s*[\d.]+(rem|px|em)/);
        // A font stack written out here would not follow the system's own.
        expect(content).not.toMatch(/font-family:(?!\s*var\()/);
    });

    it.each(stylesheets)('%s uses only spacing, border and colour tokens for chrome', (_name, content) => {
        const declarations = content.match(/(?:padding|margin|gap|border-radius):[^;]+;/g) ?? [];
        const rawLengths = declarations.filter(
            (declaration) => /\b\d+(\.\d+)?(px|rem)\b/.test(declaration) && !declaration.includes('var(')
        );

        expect(rawLengths).toEqual([]);
    });
});
