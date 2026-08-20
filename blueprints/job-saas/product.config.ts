export const productConfig = {
  name: "Job Agent",
  slug: "job-agent",
  description: "A continuous AI job-search agent that finds strong matches, tailors a truthful CV for each one, prepares applications, and tracks outcomes.",
  billing: {
    enabled: true,
    referenceCurrency: "USD",
    plans: [
      { id: "pro_monthly", name: "Pro", priceLabel: "$19/month", interval: "month" },
      { id: "autopilot_monthly", name: "Autopilot", priceLabel: "$39/month", interval: "month" }
    ]
  },
  features: { uploads: true, billing: true, ai: true, api: true, mcp: true, agentDistribution: true, jobAgent: true }
} as const;
