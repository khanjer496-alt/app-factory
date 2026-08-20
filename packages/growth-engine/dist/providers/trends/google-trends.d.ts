import { RssTrendProvider } from "./rss";
/**
 * Best-effort Google Trends "Trending now" RSS adapter.
 * Google does not offer a general public Trends API for this feed, so keep this
 * provider optional and swappable. If Google changes the feed, disable it and
 * use another normalized RSS/search provider without changing Trend Scout.
 */
export declare function createGoogleTrendsProvider(fetcher?: typeof fetch): RssTrendProvider;
