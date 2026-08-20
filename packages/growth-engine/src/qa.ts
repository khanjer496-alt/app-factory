import type { ContentIdea, ProductBrain, QAResult } from "./types";

function includesNormalized(haystack: string, needle: string) {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

export function runContentQA(product: ProductBrain, idea: ContentIdea): QAResult {
  const issues = [] as QAResult["issues"];
  const combined = [idea.hook, idea.angle, idea.script ?? "", idea.cta ?? ""].join("\n");

  for (const claim of product.prohibitedClaims) {
    if (claim && includesNormalized(combined, claim)) {
      issues.push({
        code: "PROHIBITED_CLAIM",
        severity: "block",
        message: `Content includes prohibited claim/pattern: ${claim}`,
      });
    }
  }

  if (idea.risk === "high") {
    issues.push({ code: "HIGH_RISK", severity: "block", message: "High-risk content requires human review." });
  }

  if (idea.format === "ugc_avatar") {
    issues.push({
      code: "UGC_DISCLOSURE_REVIEW",
      severity: "warn",
      message: "Review avatar/AI disclosure, testimonial framing and platform rules before publishing.",
    });
  }

  if (idea.confidence < product.autonomy.minAutoPublishConfidence) {
    issues.push({
      code: "LOW_CONFIDENCE",
      severity: "warn",
      message: "Below product auto-publish confidence threshold.",
    });
  }

  const passed = !issues.some((i) => i.severity === "block");
  const autoPublishEligible =
    passed &&
    product.autonomy.mode !== "review" &&
    !issues.some((i) => i.severity !== "info");

  return { passed, autoPublishEligible, issues };
}
