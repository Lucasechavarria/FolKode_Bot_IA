import { describe, it, expect, getResults, resetResults } from './test-helpers.js';
import { locales } from '../i18n/locales.js';

export const run = () => {
    resetResults();
    const supportedLanguages = ['en', 'es', 'pt'];
    const localeKeys = Object.keys(locales);

    describe('Internationalization (i18n) Locale Integrity', () => {
        
        it('should have all keys defined for all supported languages', () => {
            let missingKeys = false;
            
            localeKeys.forEach(key => {
                supportedLanguages.forEach(lang => {
                    if (locales[key][lang] === undefined || locales[key][lang] === null) {
                        console.error(`  - Missing translation for key "${key}" in language "${lang}"`);
                        missingKeys = true;
                    }
                });
            });

            expect(missingKeys).toBe(false);
        });

        it('should have English as a fallback language for all keys', () => {
             localeKeys.forEach(key => {
                const hasEnglishKey = locales[key].en !== undefined && locales[key].en !== null;
                expect(hasEnglishKey).toBe(true);
             });
        });
    });

    return getResults();
};
