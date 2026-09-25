export const productConfig = {
  name: "Dietbox",
  slug: "dietbox",
  description: "Chef-cooked, macro-counted meal plans delivered daily across the UAE.",
  supportEmail: "hello@dietbox.ae",
  market: {
    // Regional product by explicit spec (see PRODUCT_SPEC.md): UAE delivery, AED pricing, English first.
    country: "AE",
    currency: "AED",
    locale: "en-AE",
    timeZone: "Asia/Dubai",
  },
  billing: {
    // Meal plans are auto-renewing Stripe subscriptions priced server-side from shared/catalog.ts
    // (worker/services/meal-billing.ts). The starter's generic Pro-plan checkout is not used by Dietbox.
    enabled: false,
    plans: [
      { id: "meal-plan", name: "Meal plan package", priceLabel: "from AED 39/meal" },
    ],
  },
  features: {
    uploads: false,
    billing: false,
    mealPlans: true,
    analytics: true,
    turnstile: true,
    growthEngine: false,
    mcp: false,
  },
} as const;
