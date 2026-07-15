---
name: shop-amazon
description: Use when the user asks to shop on Amazon, compare Amazon products, research purchase options, or build a product shortlist. Verifies product-page ASIN/title/price/rating/review data and ranks options by user criteria, favoring review count when ratings are close.
---

# Shop Amazon

Search Amazon, verify product facts on product pages, and return ranked recommendations.

## Requirements Gate

Before browser automation, ask directly for any missing shopping constraints:

- Budget or comfortable price range
- Usage context: personal, gift, professional, compatibility need, etc.
- Deal-breakers: required features, avoided brands/materials, shipping needs

If the user already supplied enough constraints, proceed.

## Browser Access

Open Amazon through the normal browser surface available in the current environment. Use the available page-interaction path that can reliably search, open product pages, and verify product details.

Keep the same browser page or session for search and product verification when possible. Leave Amazon open only when the user explicitly asks for it.

## Workflow

1. Search Amazon directly at `https://www.amazon.com/s?k=<encoded search query>`.
2. Extract product names and ASINs from the same result container. Never pair a list of names with a separate list of ASINs.
3. Visit each candidate product page before presenting it.
4. Keep only products whose product page confirms title match, current price, rating, and review count.
5. Rank by the user's criteria. When ratings are within 0.5 stars, prefer the product with more reviews.

Extract the ASIN from the product link in the same result container as its heading (`/dp/B0XXXXXXXXX` or `/gp/product/B0XXXXXXXXX`), then verify the product-page title. Ignore search-result prices. If a product page lacks price, rating, or review count, drop it. For CAPTCHA, 403, or empty results, wait about 60 seconds, return to `https://www.amazon.com`, retry once, then report rate limiting. Use a concise ranked list or table with product, price, ASIN, rating, review count, match, and trade-offs; mark `(verified)` only after product-page checks.

## Account Actions

Do not add items to cart, buy, reorder, subscribe, send gifts, apply coupons, or start checkout unless the user explicitly asks for that exact action. Treat product research as read-only by default.

## Output Rules

- Present only product-page-verified items.
- Use clean links: `https://www.amazon.com/dp/<ASIN>`.
- Include ASIN, product-page price, rating, review count, why it matches, and key trade-offs.
- Mark each item `(verified)` only after product-page title, price, rating, and review count were checked.
