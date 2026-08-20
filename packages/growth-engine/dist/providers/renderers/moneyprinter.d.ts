import type { RenderRequest, RenderResult } from "../../types";
import type { RendererProvider } from "./interface";
export interface MoneyPrinterConfig {
    baseUrl: string;
    accessClientId?: string;
    accessClientSecret?: string;
}
export declare class MoneyPrinterRenderer implements RendererProvider {
    private readonly config;
    readonly name = "moneyprinterturbo";
    constructor(config: MoneyPrinterConfig);
    supports(format: RenderRequest["idea"]["format"]): format is "faceless_video";
    private headers;
    start(request: RenderRequest): Promise<RenderResult>;
    status(providerJobId: string): Promise<RenderResult>;
}
