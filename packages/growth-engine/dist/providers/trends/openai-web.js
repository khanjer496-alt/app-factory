/**
 * Optional broad-web Trend Scout source using OpenAI Responses + web_search.
 * Treat as discovery, not ground-truth volume data. Direct platform/provider
 * metrics should receive higher confidence when available.
 */
export class OpenAIWebTrendProvider {
    options;
    name = "openai_web_search";
    fetcher;
    constructor(options) {
        this.options = options;
        this.fetcher = options.fetcher ?? fetch;
    }
    async collect(query) {
        const now = query.now ?? new Date();
        const maxSignals = Math.min(query.limit ?? this.options.maxSignals ?? 20, this.options.maxSignals ?? 20);
        const product = query.product;
        const prompt = JSON.stringify({
            task: "Find currently emerging public-web content trends relevant to this product. Focus on reusable hooks, formats, memes, questions, creator patterns, and topics rather than general breaking news. Return only JSON.",
            product: product ? {
                name: product.name,
                oneLiner: product.oneLiner,
                audiences: product.audiences,
                contentPillars: product.contentPillars,
                positioning: product.positioning,
            } : undefined,
            regions: query.regions ?? [],
            languages: query.languages ?? [],
            keywords: query.keywords ?? [],
            maxSignals,
            output: {
                signals: [{ text: "trend description", url: "source URL", platform: "web/tiktok/instagram/youtube/x/etc", format: "format if known", region: "optional", language: "optional", keywords: ["..."], confidence: 0.0, reason: "why it appears current/relevant" }],
            },
        });
        const response = await this.fetcher(`${(this.options.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "")}/responses`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${this.options.apiKey}`,
            },
            body: JSON.stringify({
                model: this.options.model,
                tools: [{ type: "web_search" }],
                instructions: "Search the current public web. Return only JSON matching the requested shape. Never invent URLs or volume statistics.",
                input: prompt,
                store: false,
            }),
        });
        if (!response.ok) {
            const detail = (await response.text()).slice(0, 800);
            throw new Error(`OpenAI web trend search ${response.status}: ${detail}`);
        }
        const payload = (await response.json());
        const text = payload.output_text ?? payload.output
            ?.flatMap((item) => item.content ?? [])
            .map((item) => item.text ?? "")
            .join("") ?? "";
        const parsed = JSON.parse(extractJson(text));
        return (parsed.signals ?? []).slice(0, maxSignals).flatMap((item, index) => {
            if (!item.text?.trim())
                return [];
            const confidence = Math.min(0.78, Math.max(0.35, item.confidence ?? 0.62));
            return [{
                    id: `openaiweb:${stableHash(`${item.url ?? ""}:${item.text}:${index}`)}`,
                    source: this.name,
                    observedAt: now.toISOString(),
                    ...(item.region ? { region: item.region } : query.regions?.[0] ? { region: query.regions[0] } : {}),
                    ...(item.language ? { language: item.language } : query.languages?.[0] ? { language: query.languages[0] } : {}),
                    ...(item.platform ? { platform: item.platform } : {}),
                    ...(item.format ? { format: item.format } : {}),
                    text: item.text.trim(),
                    ...(item.url ? { url: item.url } : {}),
                    keywords: item.keywords?.length ? item.keywords : tokenize(item.text).slice(0, 10),
                    confidence,
                    metadata: { discoveryReason: item.reason ?? "web search discovery" },
                }];
        });
    }
}
function extractJson(text) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    if (fenced)
        return fenced.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start)
        return text.slice(start, end + 1);
    return text.trim();
}
function tokenize(value) {
    return [...new Set(value.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_-]{2,}/gu) ?? [])];
}
function stableHash(value) {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++)
        h = Math.imul(h ^ value.charCodeAt(i), 16777619);
    return (h >>> 0).toString(36);
}
//# sourceMappingURL=openai-web.js.map