import { RssTrendProvider } from "./rss";
import type { TrendQuery } from "./interface";

/**
 * Best-effort Google Trends "Trending now" RSS adapter.
 * Google does not offer a general public Trends API for this feed, so keep this
 * provider optional and swappable. If Google changes the feed, disable it and
 * use another normalized RSS/search provider without changing Trend Scout.
 */
export function createGoogleTrendsProvider(fetcher?: typeof fetch) {
  return new RssTrendProvider({
    name: "google_trends",
    ...(fetcher ? { fetcher } : {}),
    defaultConfidence: 0.82,
    feedUrl: (query: TrendQuery) => {
      const geo = (query.regions?.[0] ?? "US").toUpperCase();
      return `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`;
    },
  });
}
