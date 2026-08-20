/** Lightweight Cloudflare-compatible adapter for OpenAI's Responses API. */
export class OpenAIResponsesTextModel {
    options;
    fetcher;
    constructor(options) {
        this.options = options;
        this.fetcher = options.fetcher ?? fetch;
    }
    async generate(request) {
        const body = {
            model: this.options.model,
            instructions: request.system,
            input: request.prompt,
            store: false,
        };
        if (request.maxOutputTokens)
            body.max_output_tokens = request.maxOutputTokens;
        const response = await this.fetcher(`${(this.options.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "")}/responses`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${this.options.apiKey}`,
                ...(this.options.extraHeaders ?? {}),
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const detail = (await response.text()).slice(0, 800);
            throw new Error(`OpenAI Responses API ${response.status}: ${detail}`);
        }
        const payload = (await response.json());
        const text = payload.output_text ?? payload.output
            ?.flatMap((item) => item.content ?? [])
            .filter((item) => item.type === "output_text" || typeof item.text === "string")
            .map((item) => item.text ?? "")
            .join("") ?? "";
        if (!text.trim())
            throw new Error("OpenAI Responses API returned no text output");
        return { text, model: payload.model ?? this.options.model };
    }
}
//# sourceMappingURL=openai-responses.js.map