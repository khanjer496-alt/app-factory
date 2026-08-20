import type { ContentBrainReport, TrendScoutReport } from "../types";
export interface D1PreparedStatementLike {
    bind(...values: unknown[]): D1PreparedStatementLike;
    run(): Promise<unknown>;
}
export interface D1DatabaseLike {
    prepare(sql: string): D1PreparedStatementLike;
    batch(statements: D1PreparedStatementLike[]): Promise<unknown>;
}
export declare function persistTrendScoutReport(db: D1DatabaseLike, report: TrendScoutReport): Promise<void>;
export declare function persistContentBrainReport(db: D1DatabaseLike, report: ContentBrainReport): Promise<void>;
