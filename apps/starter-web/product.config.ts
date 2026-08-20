export const productConfig = {
  name: "App Factory Product",
  slug: "app-factory-product",
  description: "A Cloudflare-native SaaS starter.",
  supportEmail: "support@example.com",
  billing: {
    enabled: true,
    plans: [
      { id: "pro-monthly", name: "Pro Monthly", priceLabel: "$19/mo" },
      { id: "pro-annual", name: "Pro Annual", priceLabel: "$190/yr" },
    ],
  },
  features: {
    uploads: true,
    billing: true,
    analytics: true,
    turnstile: true,
    growthEngine: false,
    mcp: false,
  },
} as const;
