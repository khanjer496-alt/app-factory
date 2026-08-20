import type { RenderRequest, RenderResult } from "../../types";

export interface RendererProvider {
  readonly name: string;
  supports(format: RenderRequest["idea"]["format"]): boolean;
  start(request: RenderRequest): Promise<RenderResult>;
  status?(providerJobId: string): Promise<RenderResult>;
}
