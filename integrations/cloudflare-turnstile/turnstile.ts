/**
 * Cloudflare Turnstile server-side validation helper.
 *
 * The sitekey is public and belongs in frontend config. The secret key must
 * stay in a Worker secret. Client-side completion without Siteverify is not
 * protection.
 */
export interface TurnstileVerifyOptions {
  token: string;
  secretKey: string;
  remoteIp?: string;
  expectedHostname?: string;
  expectedAction?: string;
  timeoutMs?: number;
}

export interface TurnstileVerifyResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  "error-codes"?: string[];
}

export async function verifyTurnstile(options: TurnstileVerifyOptions): Promise<TurnstileVerifyResult> {
  if (!options.token || options.token.length > 2048) {
    return { success: false, "error-codes": ["invalid-input-response"] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: options.secretKey,
        response: options.token,
        remoteip: options.remoteIp,
        idempotency_key: crypto.randomUUID(),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { success: false, "error-codes": ["siteverify-http-error"] };
    }

    const result = (await response.json()) as TurnstileVerifyResult;
    if (!result.success) return result;
    if (options.expectedHostname && result.hostname !== options.expectedHostname) {
      return { ...result, success: false, "error-codes": ["hostname-mismatch"] };
    }
    if (options.expectedAction && result.action !== options.expectedAction) {
      return { ...result, success: false, "error-codes": ["action-mismatch"] };
    }
    return result;
  } catch {
    return { success: false, "error-codes": ["siteverify-unavailable"] };
  } finally {
    clearTimeout(timeout);
  }
}
