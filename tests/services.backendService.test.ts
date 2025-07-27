import { describe, it, expect, beforeEach, afterEach, getResults, resetResults, mockFn } from './test-helpers.js';
import { backendService } from '../services/backendService.js';
import { User, Message, SummaryReport, MeetingDetails, ContactMethod } from '../types/index.js';

const N8N_WEBHOOK_URL = 'https://PLACEHOLDER.com/REPLACE_WITH_YOUR_WEBHOOK_URL';

export const run = () => {
    resetResults();
    
    // Mock fetch
    const originalFetch = globalThis.fetch;
    let mockedFetch: any;

    describe('Backend Service', () => {

        beforeEach(() => {
            mockedFetch = mockFn();
            globalThis.fetch = mockedFetch;
        });

        afterEach(() => {
            globalThis.fetch = originalFetch;
        });

        const mockUser: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };

        it('saveLead should call fetch with the correct payload', async () => {
            await backendService.saveLead(mockUser);
            
            expect(mockedFetch).toHaveBeenCalled();
            const fetchCall = mockedFetch.mock.calls[0];
            const url = fetchCall[0];
            const options = fetchCall[1];
            
            expect(url).toBe(N8N_WEBHOOK_URL);
            expect(options.method).toBe('POST');
            const body = JSON.parse(options.body);
            expect(body.type).toBe('LEAD_CAPTURE');
            expect(body.data).toEqual(mockUser);
        });

        it('sendFullChatReport should send a clean transcript and all data', async () => {
            const mockMessages: Message[] = [
                { id: '1', sender: 'user', text: 'Hello', timestamp: 123 },
                { id: '2', sender: 'bot', text: 'Hi', timestamp: 124, file: { name: 'a.jpg', dataUrl: '...', mimeType: 'image/jpeg' } },
                { id: '3', sender: 'bot', text: '', timestamp: 125, component: 'MeetingScheduler' }
            ];
            const mockSummary: SummaryReport = { summary: 'Test summary', tags: ['Test'], temperature: 'Warm' };
            const mockMeetingDetails: MeetingDetails = { contactMethod: 'email', contactInfo: 'test@example.com', timeSlot: 'Tomorrow Morning' };

            await backendService.sendFullChatReport(mockUser, mockMessages, mockSummary, mockMeetingDetails);
            
            expect(mockedFetch).toHaveBeenCalled();
            const fetchCall = mockedFetch.mock.calls[0];
            const url = fetchCall[0];
            const options = fetchCall[1];
            const body = JSON.parse(options.body);

            expect(url).toBe(N8N_WEBHOOK_URL);
            expect(body.type).toBe('CHAT_REPORT');
            expect(body.data.user).toEqual(mockUser);
            expect(body.data.summary).toEqual(mockSummary);
            expect(body.data.meetingDetails).toEqual(mockMeetingDetails);
            
            // Verify that the transcript is cleaned
            const expectedTranscript = [
                { id: '1', sender: 'user', text: 'Hello', timestamp: 123, isComponent: false },
                { id: '2', sender: 'bot', text: 'Hi', timestamp: 124, isComponent: false },
                { id: '3', sender: 'bot', text: '', timestamp: 125, isComponent: true }
            ];
            expect(body.data.transcript).toEqual(expectedTranscript);
        });

    });

    return getResults();
};