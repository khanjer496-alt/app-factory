import type { ContentIdea, Platform, ProductBrain, RenderResult } from "./types";
import type { RendererProvider } from "./providers/renderers/interface";
import type { PublisherProvider } from "./providers/publishers/interface";
import type { SocialConnectionRecord } from "./runtime";
export interface DailySelection {
    idea: ContentIdea;
    targetConnections: SocialConnectionRecord[];
}
export declare function compatiblePlatforms(idea: ContentIdea): Platform[];
export declare function selectTargets(product: ProductBrain, ideas: ContentIdea[], connections: SocialConnectionRecord[], remainingPublishSlots: number): DailySelection[];
export declare function findRenderer(idea: ContentIdea, renderers: RendererProvider[]): RendererProvider | undefined;
export declare function findPublisher(platform: Platform, publishers: PublisherProvider[]): PublisherProvider | undefined;
export declare function mediaUrlFromRender(result: RenderResult | undefined): string | undefined;
export declare function publishText(idea: ContentIdea): string;
