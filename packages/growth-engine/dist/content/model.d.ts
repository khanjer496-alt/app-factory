export interface TextModelRequest {
    system: string;
    prompt: string;
    temperature?: number;
    maxOutputTokens?: number;
}
export interface TextModelResponse {
    text: string;
    model?: string;
}
/** Adapter implemented by the App Factory AI router (Luna/Sol/etc.). */
export interface TextModel {
    generate(request: TextModelRequest): Promise<TextModelResponse>;
}
