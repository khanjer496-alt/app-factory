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
export class OpenAIResponsesTextModel implements TextModel {
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: OpenAIResponsesModelOptions) {
    this.fetcher = options.fetcher ?? fetch;
  }

  async generate(request: TextModelRequest): Promise<TextModelResponse> {
    const body: Record<string, unknown> = {
      model: this.options.model,
      instructions: request.system,
      input: request.prompt,
      store: false,
    };
    if (request.maxOutputTokens) body.max_output_tokens = request.maxOutputTokens;

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
    const payload = (await response.json()) as {
      output_text?: string;
      model?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const text = payload.output_text ?? payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" || typeof item.text === "string")
      .map((item) => item.text ?? "")
      .join("") ?? "";
    if (!text.trim()) throw new Error("OpenAI Responses API returned no text output");
    return { text, model: payload.model ?? this.options.model };
  }
}
