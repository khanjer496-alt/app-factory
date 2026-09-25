import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";
import type { Env } from "./env";
import { sendDeleteVerification, sendReset, sendVerification } from "./services/email";
import { cleanupBeforeAuthUserDelete } from "./services/account-cleanup";

type WaitUntilContext = Pick<ExecutionContext, "waitUntil">;

export function createAuth(env: Env, ctx?: WaitUntilContext) {
  const plugins = env.TURNSTILE_SECRET_KEY ? [captcha({ provider: "cloudflare-turnstile", secretKey: env.TURNSTILE_SECRET_KEY })] : [];
  const socialProviders = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } } : undefined;
  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || env.APP_URL,
    trustedOrigins: [env.APP_URL],
    emailAndPassword: {
      enabled: true,
      // The client preview has no email binding, so preview sign-ups go straight in.
      requireEmailVerification: env.APP_ENV !== "preview",
      minPasswordLength: 10,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      customSyntheticUser: ({ coreFields, additionalFields, id }) => ({ ...coreFields, ...additionalFields, id }),
      sendResetPassword: async ({ user, url }) => {
        const promise = sendReset(env, user.email, url);
        ctx ? ctx.waitUntil(promise) : await promise;
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      // Verified users land back in the plan builder signed in, with their saved draft.
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const promise = sendVerification(env, user.email, url);
        ctx ? ctx.waitUntil(promise) : await promise;
      },
    },
    user: {
      additionalFields: {
        role: { type: ["user", "admin"], required: false, defaultValue: "user", input: false },
      },
      deleteUser: {
        enabled: true,
        sendDeleteAccountVerification: async ({ user, url }) => {
          const promise = sendDeleteVerification(env, user.email, url);
          ctx ? ctx.waitUntil(promise) : await promise;
        },
        beforeDelete: async (user) => {
          await cleanupBeforeAuthUserDelete(env, user);
        },
      },
    },
    socialProviders,
    plugins,
  });
}

export type SessionResult = Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;

export async function getSession(env: Env, request: Request, ctx?: WaitUntilContext) {
  return createAuth(env, ctx).api.getSession({ headers: request.headers });
}
