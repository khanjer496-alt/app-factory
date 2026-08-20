/**
 * Official YouTube Data API trend signal provider.
 * Searches fresh videos around product keywords and enriches them with statistics.
 */
export class YouTubeTrendProvider {
    options;
    name = "youtube";
    fetcher;
    maxQueries;
    maxResults;
    constructor(options) {
        this.options = options;
        this.fetcher = options.fetcher ?? fetch;
        this.maxQueries = options.maxQueries ?? 4;
        this.maxResults = Math.min(50, options.maxResultsPerQuery ?? 12);
    }
    async collect(query) {
        const now = query.now ?? new Date();
        const lookbackHours = query.lookbackHours ?? 72;
        const publishedAfter = new Date(now.getTime() - lookbackHours * 3600_000).toISOString();
        const keywords = this.buildQueries(query).slice(0, this.maxQueries);
        const all = [];
        for (const keyword of keywords) {
            const params = new URLSearchParams({
                part: "snippet",
                type: "video",
                order: "viewCount",
                maxResults: String(this.maxResults),
                publishedAfter,
                q: keyword,
                key: this.options.apiKey,
            });
            const region = query.regions?.[0];
            const lang = query.languages?.[0];
            if (region)
                params.set("regionCode", region.toUpperCase());
            if (lang)
                params.set("relevanceLanguage", lang);
            const searchRes = await this.fetcher(`https://www.googleapis.com/youtube/v3/search?${params}`);
            if (!searchRes.ok)
                throw new Error(`YouTube search failed: ${searchRes.status}`);
            const searchJson = (await searchRes.json());
            const ids = (searchJson.items ?? []).map((i) => i.id?.videoId).filter((v) => Boolean(v));
            if (!ids.length)
                continue;
            const videoParams = new URLSearchParams({
                part: "snippet,statistics",
                id: ids.join(","),
                key: this.options.apiKey,
            });
            const videoRes = await this.fetcher(`https://www.googleapis.com/youtube/v3/videos?${videoParams}`);
            if (!videoRes.ok)
                throw new Error(`YouTube videos lookup failed: ${videoRes.status}`);
            const videoJson = (await videoRes.json());
            for (const item of videoJson.items ?? []) {
                if (!item.id || !item.snippet?.title)
                    continue;
                const publishedAt = item.snippet.publishedAt ?? now.toISOString();
                const ageHours = Math.max(1, (now.getTime() - new Date(publishedAt).getTime()) / 3600_000);
                const views = Number(item.statistics?.viewCount ?? 0);
                const likes = Number(item.statistics?.likeCount ?? 0);
                const comments = Number(item.statistics?.commentCount ?? 0);
                const velocity = views > 0 ? views / ageHours : 0;
                const engagementRate = views > 0 ? (likes + comments) / views : 0;
                const tags = item.snippet.tags ?? [];
                const metadata = {
                    videoId: item.id, publishedAt, views, likes, comments, query: keyword,
                };
                if (item.snippet.channelTitle)
                    metadata.channelTitle = item.snippet.channelTitle;
                all.push({
                    id: `youtube:${item.id}`,
                    source: this.name,
                    observedAt: now.toISOString(),
                    ...(region ? { region } : {}),
                    ...(lang ? { language: lang } : {}),
                    platform: "youtube",
                    format: "short_video",
                    text: item.snippet.title,
                    url: `https://www.youtube.com/watch?v=${item.id}`,
                    keywords: unique([keyword, ...tags.slice(0, 8)]),
                    velocity,
                    volume: views,
                    engagementRate,
                    confidence: 0.9,
                    metadata,
                });
            }
        }
        return dedupeById(all).slice(0, query.limit ?? 100);
    }
    buildQueries(query) {
        const direct = query.keywords ?? [];
        const product = query.product;
        const fromProduct = product
            ? [product.name, ...product.contentPillars, ...product.audiences, ...product.positioning]
            : [];
        return unique([...direct, ...fromProduct].map((x) => x.trim()).filter(Boolean));
    }
}
function unique(values) {
    return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}
function dedupeById(values) {
    return [...new Map(values.map((v) => [v.id, v])).values()];
}
//# sourceMappingURL=youtube.js.map