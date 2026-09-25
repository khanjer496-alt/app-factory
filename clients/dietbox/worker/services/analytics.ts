import type { Env } from "../env";
export function track(env: Env, input: { actor?: string; event: string; feature?: string; value?: number; costUsd?: number }) {
  env.ANALYTICS?.writeDataPoint({
    indexes: [input.actor || "anonymous"],
    blobs: [input.event.slice(0,256), env.APP_NAME.slice(0,256), env.APP_ENV.slice(0,64), (input.feature||"").slice(0,256)],
    doubles: [input.value || 0, input.costUsd || 0],
  });
}
