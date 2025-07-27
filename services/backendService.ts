
import { User, Message, SummaryReport, MeetingDetails } from '../types';

// ====================================================================================
// IMPORTANT: ACTION REQUIRED
// ====================================================================================
// This URL is the connection point between your app and your backend services.
// To handle lead notifications (Email, Discord, etc.), you need to use a
// workflow automation tool like n8n, Zapier, or Make.com.
//
// 1. Create a "Webhook" trigger in your chosen automation tool.
// 2. It will give you a unique URL. Paste that URL here.
// 3. Create a workflow that takes the webhook data and sends emails, Discord
//    messages, or saves to a database.
//
// See the INTEGRATION_GUIDE.md file for a complete step-by-step guide.
// ====================================================================================
const N8N_WEBHOOK_URL = 'https://PLACEHOLDER.com/REPLACE_WITH_YOUR_WEBHOOK_URL'; 

const checkWebhookUrl = () => {
  if (N8N_WEBHOOK_URL.includes('PLACEHOLDER')) {
      console.warn(`
        ====================================================================================
        BACKEND SERVICE WARNING:
        Using a placeholder Webhook URL. Lead data is NOT being sent anywhere.
        Please update the 'N8N_WEBHOOK_URL' in 'services/backendService.ts'
        and follow the instructions in 'INTEGRATION_GUIDE.md' to set up
        your email and Discord notifications.
        ====================================================================================
      `);
      return false;
  }
  return true;
}

/**
 * A backend service that sends data to an automation webhook (e.g., n8n).
 */
export const backendService = {
  /**
   * Saves a new lead (user) by sending it to the automation webhook.
   */
  saveLead: async (user: User): Promise<void> => {
    console.log('SENDING LEAD TO WEBHOOK:', user);
    if (!checkWebhookUrl()) return;
    
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'LEAD_CAPTURE', data: user }),
      });
    } catch (error) {
      console.error('Failed to save lead via webhook:', error);
    }
  },

  /**
   * Sends a complete report with user data, chat summary, and full transcript
   * to the automation webhook at the end of the conversation.
   */
  sendFullChatReport: async (user: User, messages: Message[], summaryReport: SummaryReport, meetingDetails?: MeetingDetails): Promise<void> => {
    const contactIdentifier = `${user.contactMethod}: ${user.contactInfo}`;
    console.log('SENDING FULL CHAT REPORT TO WEBHOOK for:', contactIdentifier);
    if (!checkWebhookUrl()) return;

    // We filter out any feedback, file data, or interactive components before sending.
    const cleanMessages = messages.map(({ id, sender, text, timestamp, component }) => ({
        id, sender, text, timestamp, isComponent: !!component
    }));

    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'CHAT_REPORT', 
          data: { 
            user, 
            summary: summaryReport,
            meetingDetails,
            transcript: cleanMessages
          } 
        }),
      });
    } catch (error) {
      console.error('Failed to send chat report via webhook:', error);
    }
  },
};