import type { ProductBrain } from "../../types";

export interface GrowthMetricObservation {
  publicationId: string;
  observedAt: string;
  views?: number;
  impressions?: number;
  engagements?: number;
  clicks?: number;
  signups?: number;
  paidConversions?: number;
  revenueUsd?: number;
  raw?: Record<string, unknown>;
}

export interface MetricsProvider {
  readonly name: string;
  collect(product: ProductBrain): Promise<GrowthMetricObservation[]>;
}
