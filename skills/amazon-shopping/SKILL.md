---
name: amazon-shopping
description: Use when the user asks to shop on Amazon, compare Amazon products, or research purchase options. Searches Amazon in Chrome, verifies product-page ASIN/title/price data, and ranks options by user criteria with review count favored when ratings are close.
allowed-tools: "tool_search_tool, mcp__node_repl__*"
---

# Amazon Shopping

Search Amazon, verify product facts on product pages, and return ranked recommendations.

## Requirements Gate

Before browser automation, ask directly for any missing shopping constraints:

- Budget or comfortable price range
- Usage context: personal, gift, professional, compatibility need, etc.
- Deal-breakers: required features, avoided brands/materials, shipping needs

If the user already supplied enough constraints, proceed.

## Browser Backend

Use the Chrome plugin through the `chrome:control-chrome` skill and its Node REPL `js` tool. Do not use Chrome DevTools MCP for this workflow.

Before the first browser action:

1. Read `chrome:control-chrome` if it is not already loaded.
2. If the Node REPL `js` tool is unavailable, use `tool_search_tool` for `node_repl js`.
3. Bootstrap with the current Chrome plugin root and `setupBrowserRuntime`; do not hardcode a plugin version.
4. Reuse one `tab` for search and product verification.

End Chrome work with `browser.tabs.finalize({ keep: [] })` unless the user explicitly asked to keep the Amazon page open.

## Workflow

1. Search Amazon directly:

   ```js
   await tab.goto(`https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`);
   await tab.playwright.waitForLoadState({ state: "domcontentloaded", timeoutMs: 15000 });
   const snapshot = await tab.playwright.domSnapshot();
   nodeRepl.write(snapshot);
   ```

2. Extract product names and ASINs from the same result container. Never pair a list of names with a separate list of ASINs.
3. Visit each candidate product page before presenting it:

   ```js
   await tab.goto(`https://www.amazon.com/dp/${asin}`);
   const productSnapshot = await tab.playwright.domSnapshot();
   nodeRepl.write(productSnapshot);
   ```

4. Keep only products whose product page confirms title match, current price, rating, and review count.
5. Rank by the user's criteria. When ratings are within 0.5 stars, prefer the product with more reviews.

Read references only when needed:

- [reference/asin-extraction.md](reference/asin-extraction.md): ASIN patterns and mismatch prevention.
- [reference/common-errors.md](reference/common-errors.md): CAPTCHA, rate-limit, slow-load, and verification recovery.
- [reference/output-formats.md](reference/output-formats.md): Shortlist and table templates.

## Output Rules

- Present only product-page-verified items.
- Use clean links: `https://www.amazon.com/dp/<ASIN>`.
- Include ASIN, product-page price, rating, review count, why it matches, and key trade-offs.
- Mark each item `(verified)` only after product-page title, price, rating, and review count were checked.
