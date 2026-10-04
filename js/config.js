// Store settings. Change these before going live.
export const CONFIG = {
  // WhatsApp number that receives orders, in international format without "+"
  whatsappNumber: "972592607179",

  // Demo data comes from DummyJSON in USD; prices are converted to SAR
  apiBase: "https://dummyjson.com",
  usdToSar: 3.75,

  // Delivery (SAR)
  freeDeliveryThreshold: 200,
  deliveryFee: 25,
};

// Categories Bloom sells, in display order. `slug` is the DummyJSON category.
export const CATEGORIES = [
  { slug: "skin-care", group: "beauty", tint: "blush" },
  { slug: "beauty", group: "beauty", tint: "sage" },
  { slug: "fragrances", group: "beauty", tint: "lilac" },
  { slug: "womens-dresses", group: "fashion", tint: "sand" },
  { slug: "tops", group: "fashion", tint: "sky" },
  { slug: "womens-bags", group: "fashion", tint: "blush" },
  { slug: "womens-shoes", group: "fashion", tint: "sage" },
  { slug: "womens-jewellery", group: "fashion", tint: "lilac" },
  { slug: "womens-watches", group: "fashion", tint: "sand" },
  { slug: "sunglasses", group: "fashion", tint: "sky" },
];

export const GROUPS = ["beauty", "fashion"];
