declare module "cloudflare:workers" {
  export interface WorkflowEvent<T = unknown> {
    payload: T;
    timestamp?: Date;
    instanceId?: string;
    schedule?: { cron?: string; scheduledTime?: number };
  }
  export interface WorkflowStep {
    do<T>(name: string, callback: () => Promise<T> | T): Promise<T>;
    do<T>(name: string, config: Record<string, unknown>, callback: () => Promise<T> | T): Promise<T>;
    sleep(name: string, duration: string | number): Promise<void>;
    sleepUntil(name: string, timestamp: Date | number): Promise<void>;
    waitForEvent<T = unknown>(name: string, options: { type: string; timeout?: string | number }): Promise<T>;
  }
  export class WorkflowEntrypoint<Env = unknown, Params = unknown> {
    protected env: Env;
    constructor(ctx: unknown, env: Env);
    run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<unknown>;
  }
}
