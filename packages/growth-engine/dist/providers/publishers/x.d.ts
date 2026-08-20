import type { PublishRequest, PublishResult } from "../../types";
import type { PublisherProvider, PublishingCredential } from "./interface";
export declare class XPublisher implements PublisherProvider {
    readonly platform: "x";
    publish(req: PublishRequest, cred: PublishingCredential): Promise<PublishResult>;
}
