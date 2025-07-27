import { describe, it, expect, getResults, resetResults } from './test-helpers.js';
import { personalityService } from '../services/personalityService.js';
import { CREATIVE_DIRECTOR_PROMPT, TECH_LEAD_PROMPT } from '../constants/index.js';

export const run = () => {
    resetResults();

    describe('Personality Service', () => {
        it('should return the creative director prompt for design keywords', () => {
            const message = "I want to talk about the visual design of my app";
            const prefix = personalityService.getPersonalityPrefix(message);
            expect(prefix).toBe(CREATIVE_DIRECTOR_PROMPT);
        });

        it('should return the tech lead prompt for technical keywords', () => {
            const message = "How do you handle backend scalability?";
            const prefix = personalityService.getPersonalityPrefix(message);
            expect(prefix).toBe(TECH_LEAD_PROMPT);
        });
        
        it('should return the creative director prompt for spanish design keywords', () => {
            const message = "Hablemos del diseño de la interfaz.";
            const prefix = personalityService.getPersonalityPrefix(message);
            expect(prefix).toBe(CREATIVE_DIRECTOR_PROMPT);
        });

        it('should return the tech lead prompt for spanish technical keywords', () => {
            const message = "Me preocupa la infraestructura y la base de datos.";
            const prefix = personalityService.getPersonalityPrefix(message);
            expect(prefix).toBe(TECH_LEAD_PROMPT);
        });

        it('should return an empty string for neutral messages', () => {
            const message = "Hello, I would like to know more about your company.";
            const prefix = personalityService.getPersonalityPrefix(message);
            expect(prefix).toBe('');
        });

        it('should be case-insensitive', () => {
            const message = "Tell me about your UI/UX DESIGN process.";
            const prefix = personalityService.getPersonalityPrefix(message);
            expect(prefix).toBe(CREATIVE_DIRECTOR_PROMPT);
        });
    });

    return getResults();
};
