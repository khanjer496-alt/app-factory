import type { JobSourceAdapter } from "./interface";
import type { Env } from "../../env";
import { GreenhouseSource } from "./greenhouse";
import { LeverSource } from "./lever";
import { AshbySource } from "./ashby";
import { SmartRecruitersSource } from "./smartrecruiters";
import { WorkdaySource } from "./workday";

export function sourceAdapter(provider: string, env?: Env): JobSourceAdapter | null {
  switch (provider) {
    case "greenhouse": return new GreenhouseSource();
    case "lever": return new LeverSource();
    case "ashby": return new AshbySource();
    case "smartrecruiters": return new SmartRecruitersSource();
    case "workday": return env ? new WorkdaySource(env) : null;
    default: return null;
  }
}
