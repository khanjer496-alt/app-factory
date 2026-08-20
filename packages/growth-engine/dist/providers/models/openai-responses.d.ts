import type { TextModel, TextModelRequest, TextModelResponse } from "../../content/model";
export interface OpenAIResponsesModelOptions {
    apiKey: string;
    /** Use the model ID enabled for your account. Keep this configurable for Luna/Terra/Sol routing. */
    model: string;
    baseUrl?: string;
    fetcher?: typeof fetch;
    extraHeaders?: Record<string, string>;
}
/** Lightweight Cloudflare-compatible adapter for OpenAI's Responses API. */
export declare class OpenAIResponsesTextModel implements TextModel {
    private readonly options;
    private readonly fetcher;
    constructor(options: OpenAIResponsesModelOptions);
    generate(request: TextModelRequest): Promise<TextModelResponse>;
}
