import { scoreIdea, rankIdeas } from "../scoring";
import { buildContentBrainPrompt } from "./prompts";
import { deterministicIdeas } from "./templates";
export class ContentBrain {
    async generate(product, trends, options = {}) {
        const count = options.ideaCount ?? 18;
        const runId = `brainrun_${cryptoId()}`;
        let fallbackUsed = false;
        let modelName;
        let ideas = [];
        if (options.model) {
            try {
                const prompt = buildContentBrainPrompt(product, trends, options.learnings ?? [], count);
                const response = await options.model.generate({ ...prompt, temperature: 0.75, maxOutputTokens: 7000 });
                modelName = response.model;
                ideas = this.parseModelIdeas(response.text, product, trends, count);
            }
            catch {
                fallbackUsed = true;
            }
        }
        else {
            fallbackUsed = true;
        }
        if (!ideas.length) {
            fallbackUsed = true;
            ideas = deterministicIdeas(product, trends, count);
        }
        const ranked = rankIdeas(ideas)
            .filter((idea) => idea.score >= (options.minScore ?? 45))
            .slice(0, count);
        const experiments = createExperiments(product, ranked, options.experimentCount ?? 4, options.variantsPerExperiment ?? 3);
        return {
            productId: product.productId,
            runId,
            generatedAt: new Date().toISOString(),
            trendsUsed: [...new Set(ranked.flatMap((idea) => idea.sourceTrendIds))],
            ideas: ranked,
            experiments,
            ...(modelName ? { model: modelName } : {}),
            fallbackUsed,
        };
    }
    parseModelIdeas(text, product, trends, count) {
        const json = extractJson(text);
        const parsed = JSON.parse(json);
        const knownTrendIds = new Set(trends.map((t) => t.id));
        return (parsed.ideas ?? []).slice(0, count).flatMap((raw, index) => {
            if (!raw.hook?.trim() || !raw.angle?.trim())
                return [];
            const format = validFormat(raw.format) ? raw.format : "faceless_video";
            const signal = fillSignals(raw.signals, raw.sourceTrendIds, trends);
            const sourceTrendIds = (raw.sourceTrendIds ?? []).filter((id) => knownTrendIds.has(id));
            const idea = {
                id: `idea_${cryptoId()}`,
                productId: product.productId,
                sourceTrendIds,
                hook: raw.hook.trim(),
                angle: raw.angle.trim(),
                format,
                language: raw.language ?? product.languages[index % Math.max(product.languages.length, 1)] ?? "en",
                score: scoreIdea(signal),
                confidence: clamp(raw.confidence ?? 0.7),
                risk: raw.risk ?? (format === "ugc_avatar" ? "medium" : "low"),
                ...(raw.script ? { script: raw.script } : {}),
                ...(raw.visualPlan ? { visualPlan: raw.visualPlan } : {}),
                ...(raw.cta ? { cta: raw.cta } : {}),
                ...(raw.rationale ? { rationale: raw.rationale } : {}),
                metadata: { signals: signal },
            };
            return [idea];
        });
    }
}
export function createExperiments(product, ideas, experimentCount, variantsPerExperiment) {
    const leaders = ideas.slice(0, experimentCount);
    return leaders.map((leader, experimentIndex) => {
        const group = `exp_${cryptoId()}`;
        const variants = [leader, ...ideas.filter((idea) => idea.id !== leader.id && idea.angle === leader.angle)]
            .slice(0, variantsPerExperiment)
            .map((idea, variantIndex) => ({
            ...idea,
            id: variantIndex === 0 ? idea.id : `idea_${cryptoId()}`,
            experimentGroup: group,
        }));
        if (variants.length < variantsPerExperiment) {
            const missing = variantsPerExperiment - variants.length;
            for (let i = 0; i < missing; i++) {
                variants.push({
                    ...leader,
                    id: `idea_${cryptoId()}`,
                    hook: mutateHook(leader.hook, i),
                    format: rotateFormat(leader.format, i + 1),
                    experimentGroup: group,
                    score: Math.max(0, leader.score - (i + 1) * 2),
                });
            }
        }
        return {
            id: group,
            productId: product.productId,
            hypothesis: `Changing hook/format for “${leader.angle}” will improve conversion efficiency.`,
            sourceIdeaId: leader.id,
            variants,
            primaryMetric: experimentIndex === 0 ? "paid_conversions" : experimentIndex === 1 ? "signups" : "clicks",
            status: "draft",
        };
    });
}
function fillSignals(partial, trendIds, trends) {
    const linked = trends.filter((t) => trendIds?.includes(t.id));
    const mean = (getter, fallback) => linked.length
        ? linked.reduce((sum, t) => sum + getter(t), 0) / linked.length
        : fallback;
    return {
        productRelevance: clamp(partial?.productRelevance ?? mean((t) => t.productRelevance, 0.65)),
        trendVelocity: clamp(partial?.trendVelocity ?? mean((t) => t.trendScore / 100, 0.5)),
        proofStrength: clamp(partial?.proofStrength ?? 0.72),
        conversionFit: clamp(partial?.conversionFit ?? 0.7),
        novelty: clamp(partial?.novelty ?? 0.6),
        estimatedCost: clamp(partial?.estimatedCost ?? 0.25),
        riskPenalty: clamp(partial?.riskPenalty ?? 0.1),
    };
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
function validFormat(value) {
    return ["faceless_video", "slideshow", "product_demo", "ugc_avatar", "image_post", "text_post"].includes(String(value));
}
function mutateHook(hook, index) {
    const prefixes = ["POV: ", "Quick question: ", "Most people get this wrong: ", "Before you do this again: "];
    return `${prefixes[index % prefixes.length]}${hook.replace(/^(POV:\s*)/i, "")}`;
}
function rotateFormat(format, step) {
    const formats = ["product_demo", "slideshow", "faceless_video", "ugc_avatar", "text_post"];
    const current = Math.max(0, formats.indexOf(format));
    return formats[(current + step) % formats.length] ?? format;
}
function clamp(value) { return Math.max(0, Math.min(1, value)); }
function cryptoId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}
//# sourceMappingURL=brain.js.map