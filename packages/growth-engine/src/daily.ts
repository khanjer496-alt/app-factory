import type { ContentIdea, Platform, ProductBrain, RenderResult } from "./types";
import type { RendererProvider } from "./providers/renderers/interface";
import type { PublisherProvider } from "./providers/publishers/interface";
import type { SocialConnectionRecord } from "./runtime";

export interface DailySelection {
  idea: ContentIdea;
  targetConnections: SocialConnectionRecord[];
}

export function compatiblePlatforms(idea: ContentIdea): Platform[] {
  switch (idea.format) {
    case "text_post": return ["x", "linkedin"];
    case "image_post": return ["instagram", "x", "linkedin"];
    default: return ["tiktok", "instagram", "youtube"];
  }
}

export function selectTargets(
  product: ProductBrain,
  ideas: ContentIdea[],
  connections: SocialConnectionRecord[],
  remainingPublishSlots: number,
): DailySelection[] {
  let slots = Math.max(0, remainingPublishSlots);
  const result: DailySelection[] = [];
  for (const idea of ideas) {
    if (slots <= 0) break;
    const compatible = new Set(compatiblePlatforms(idea));
    const targets = connections.filter((connection) => compatible.has(connection.platform)).slice(0, slots);
    if (!targets.length && product.autonomy.mode === "review") result.push({ idea, targetConnections: [] });
    else if (targets.length) {
      result.push({ idea, targetConnections: targets });
      slots -= targets.length;
    }
  }
  return result;
}

export function findRenderer(idea: ContentIdea, renderers: RendererProvider[]): RendererProvider | undefined {
  if (idea.format === "text_post") return undefined;
  return renderers.find((renderer) => renderer.supports(idea.format));
}

export function findPublisher(platform: Platform, publishers: PublisherProvider[]): PublisherProvider | undefined {
  return publishers.find((publisher) => publisher.platform === platform);
}

export function mediaUrlFromRender(result: RenderResult | undefined): string | undefined {
  return result?.mediaUrl ?? (result?.mediaR2Key?.startsWith("http") ? result.mediaR2Key : undefined);
}

export function publishText(idea: ContentIdea): string {
  const parts = [idea.hook, idea.script && idea.script !== idea.hook ? idea.script : undefined, idea.cta].filter(Boolean);
  return parts.join("\n\n").slice(0, 8000);
}
