import type { ProductBrain, Platform } from "./types";
import type { TrendProvider } from "./providers/trends/interface";
import type { RendererProvider } from "./providers/renderers/interface";
import type { PublisherProvider, PublishingCredential } from "./providers/publishers/interface";
import type { TextModel } from "./content/model";
import type { MetricsProvider } from "./providers/metrics/interface";

export interface SocialConnectionRecord {
  id: string;
  productId: string;
  platform: Platform;
  accountExternalId?: string;
  accountHandle?: string;
  credentialRef: string;
  scopes: string[];
  expiresAt?: string;
  status: string;
}

export interface CredentialVault {
  resolve(connection: SocialConnectionRecord): Promise<PublishingCredential>;
}

export interface GrowthRuntime {
  trendProviders(product: ProductBrain): Promise<TrendProvider[]> | TrendProvider[];
  renderers(product: ProductBrain): Promise<RendererProvider[]> | RendererProvider[];
  publishers(product: ProductBrain): Promise<PublisherProvider[]> | PublisherProvider[];
  credentialVault: CredentialVault;
  contentModel?(product: ProductBrain): Promise<TextModel | undefined> | TextModel | undefined;
  metricsProviders?(product: ProductBrain): Promise<MetricsProvider[]> | MetricsProvider[];
}
