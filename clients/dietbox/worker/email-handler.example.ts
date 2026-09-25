import { handleInboundEmail, type ForwardableEmailMessage } from "./services/inbound-email";

interface Env {
  SUPPORT_FORWARD_TO: string;
  EMAIL_DOMAIN: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    await handleInboundEmail(message, {
      supportForwardTo: env.SUPPORT_FORWARD_TO,
      allowedDomain: env.EMAIL_DOMAIN,
    });
  },
};
