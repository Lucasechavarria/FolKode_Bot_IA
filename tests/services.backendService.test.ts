import { describe, it, expect, beforeEach, afterEach, getResults, resetResults, mockFn } from './test-helpers.js';
import { backendService } from '../services/backendService.js';
import { User, Message, SummaryReport, MeetingDetails } from '../types/index.js';

// The URL is now hardcoded in the service file.
const EXPECTED_WEBHOOK_URL = 'https://formsubmit.co/contactofolkode@gmail.com';

export const run = () => {
    resetResults();
    
    // Mock fetch
    const originalFetch = globalThis.fetch;
    let mockedFetch: any;

    describe('Backend Service (with FormSubmit)', () => {

        beforeEach(() => {
            mockedFetch = mockFn();
            globalThis.fetch = mockedFetch;
        });

        afterEach(() => {
            globalThis.fetch = originalFetch;
        });

        const mockUser: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };

        it('saveLead should call fetch with a flattened payload for FormSubmit', async () => {
            await backendService.saveLead(mockUser);
            
            expect(mockedFetch).toHaveBeenCalled();
            const fetchCall = mockedFetch.mock.calls[0];
            const url = fetchCall[0];
            const options = fetchCall[1];
            
            expect(url).toBe(EXPECTED_WEBHOOK_URL);
            expect(options.method).toBe('POST');
            const body = JSON.parse(options.body);

            // Check for flattened structure and FormSubmit fields
            expect(body._subject).toBe(`Nuevo Lead Capturado: ${mockUser.name}`);
            expect(body.name).toBe(mockUser.name);
            expect(body.contactInfo).toBe(mockUser.contactInfo);
            expect(body.type).toBe('LEAD_CAPTURE');
        });

        it('sendFullChatReport should send a flattened report and clean transcript', async () => {
            const mockMessages: Message[] = [
                { id: '1', sender: 'user', text: 'Hello', timestamp: 1672531200000 },
                { id: '2', sender: 'bot', text: 'Hi', timestamp: 1672531260000 },
            ];
            const mockSummary: SummaryReport = { 
                summary: 'Test summary', 
                tags: ['Test', 'Web'], 
                temperature: 'Warm',
                leadScore: 7,
                painPoint: 'Needs a website',
                budgetMention: 'good budget',
                timelineMention: 'next quarter'
            };
            const mockMeetingDetails: MeetingDetails = { contactMethod: 'email', contactInfo: 'test@example.com', timeSlot: 'Tomorrow Morning' };

            await backendService.sendFullChatReport(mockUser, mockMessages, mockSummary, mockMeetingDetails);
            
            expect(mockedFetch).toHaveBeenCalled();
            const fetchCall = mockedFetch.mock.calls[0];
            const url = fetchCall[0];
            const options = fetchCall[1];
            const body = JSON.parse(options.body);

            expect(url).toBe(EXPECTED_WEBHOOK_URL);
            expect(body._subject).toBe(`Reporte de Chat con ${mockUser.name} - Temperatura: ${mockSummary.temperature}`);
            expect(body.summary).toBe(mockSummary.summary);
            expect(body.tags).toBe('Test, Web');
            expect(body.leadScore).toBe(7);
            expect(body.painPoint).toBe('Needs a website');
            expect(body.meeting_request).toBe(`${mockMeetingDetails.timeSlot} via ${mockMeetingDetails.contactInfo}`);
            
            // Verify that the transcript is a clean string by checking for its key components
            expect(body.transcript).toContain('] Test User: Hello');
            expect(body.transcript).toContain('] FolKode: Hi');
        });

    });

    return getResults();
};