import { CONFIG } from '../config';

export type SlackNotificationType = 'success' | 'warning' | 'error' | 'info';

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackMessage {
  text: string;
  type?: SlackNotificationType;
  title?: string;
  fields?: SlackField[];
  footer?: string;
}

const COLORS = {
  success: '#36a64f', // Green
  warning: '#ecb22e', // Orange
  error: '#ff0000',   // Red
  info: '#439fe0'     // Blue
};

export const sendSlackNotification = async (message: SlackMessage): Promise<boolean> => {
  if (!CONFIG.SLACK_WEBHOOK_URL) {
    console.warn('Slack Webhook URL not configured. Notification skipped:', message.text);
    return false;
  }

  const payload = {
    channel: CONFIG.SLACK_CHANNEL,
    username: CONFIG.SLACK_USERNAME,
    icon_emoji: CONFIG.SLACK_ICON_EMOJI,
    attachments: [
      {
        color: COLORS[message.type || 'info'],
        title: message.title,
        text: message.text,
        fields: message.fields,
        footer: message.footer || 'P3 Lending Protocol',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  try {
    // Note: Calling Slack Webhooks directly from client-side may face CORS issues depending on browser/proxy settings.
    // In a production environment, this should ideally route through a backend proxy.
    const response = await fetch(CONFIG.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      // 'no-cors' mode is used here to prevent browser blocking, but it means we can't read the response status.
      // For full functionality, ensure your server handles CORS or use a proxy.
      mode: 'no-cors' 
    });
    return true;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return false;
  }
};
