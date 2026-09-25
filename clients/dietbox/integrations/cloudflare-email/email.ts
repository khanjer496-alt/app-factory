/**
 * Cloudflare Email Service adapter for App Factory products.
 *
 * Bind Cloudflare Email Service as `EMAIL` in wrangler.jsonc and pass env.EMAIL
 * into createCloudflareEmailService(). Keep product code dependent on this
 * adapter instead of calling Cloudflare directly from features.
 */

export type EmailAddress = string | { email: string; name?: string };

export interface EmailAttachment {
  content: string | ArrayBuffer | ArrayBufferView;
  filename: string;
  type: string;
  disposition: "attachment" | "inline";
  contentId?: string;
}

export interface EmailMessage {
  to: EmailAddress | EmailAddress[];
  from: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  replyTo?: EmailAddress;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export interface CloudflareEmailBinding {
  send(message: EmailMessage): Promise<{ messageId: string }>;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface EmailServiceOptions {
  binding: CloudflareEmailBinding;
  from: EmailAddress;
  replyTo?: EmailAddress;
}

export function createCloudflareEmailService(options: EmailServiceOptions) {
  const { binding, from, replyTo } = options;

  return {
    async send(message: Omit<EmailMessage, "from"> & { from?: EmailAddress }) {
      return binding.send({
        ...message,
        from: message.from ?? from,
        replyTo: message.replyTo ?? replyTo,
      });
    },

    async sendTemplate(input: {
      to: EmailAddress | EmailAddress[];
      template: EmailTemplate;
      headers?: Record<string, string>;
    }) {
      return binding.send({
        to: input.to,
        from,
        replyTo,
        subject: input.template.subject,
        html: input.template.html,
        text: input.template.text,
        headers: input.headers,
      });
    },
  };
}
