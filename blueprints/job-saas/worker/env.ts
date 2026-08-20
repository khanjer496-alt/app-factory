import type { ApplicationQueueMessage } from "./job/types";
export interface CloudflareEmailBinding { send(message:{to:string|{email:string;name?:string}|Array<string|{email:string;name?:string}>;from:string|{email:string;name?:string};subject:string;html?:string;text?:string;replyTo?:string|{email:string;name?:string}}):Promise<{messageId:string}>; }
export interface Env {
  DB:D1Database; FILES:R2Bucket; ANALYTICS?:AnalyticsEngineDataset; EMAIL?:CloudflareEmailBinding;
  APPLICATION_QUEUE: Queue<ApplicationQueueMessage>;
  APP_NAME:string; APP_ENV:string; APP_URL:string; BETTER_AUTH_URL:string; BETTER_AUTH_SECRET:string; EMAIL_FROM:string;
  ADMIN_EMAIL?:string; TURNSTILE_SITE_KEY?:string; TURNSTILE_SECRET_KEY?:string;
  STRIPE_SECRET_KEY?:string; STRIPE_WEBHOOK_SECRET?:string; STRIPE_PRICE_PRO_MONTHLY?:string; STRIPE_PRICE_PRO_ANNUAL?:string;
  GOOGLE_CLIENT_ID?:string; GOOGLE_CLIENT_SECRET?:string;
  OPENAI_API_KEY?:string; OPENAI_MODEL?:string;
  APPLICATION_AUTOMATION_ENDPOINT?:string; APPLICATION_AUTOMATION_TOKEN?:string;
  JOB_DISCOVERY_AUTOMATION_ENDPOINT?:string; JOB_DISCOVERY_AUTOMATION_TOKEN?:string; REQUIRE_SUBMISSION_PROOF?:string;
  MCP_ALLOWED_ORIGINS?:string;
}
