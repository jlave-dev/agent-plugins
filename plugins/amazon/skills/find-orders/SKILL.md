---
name: find-orders
description: Use when the user asks to find Amazon orders, invoices, return windows, warranty details, reorder links, delivery status, or purchase history. Works from the user's signed-in Amazon account when available and treats order work as read-only unless the user explicitly confirms a separate account-changing action.
---

# Find Orders

Find Amazon order history, invoices, return and warranty information, delivery status, and reorder candidates.

## Requirements Gate

Before browser automation, ask only for missing constraints needed to narrow the search:

- Product, recipient, seller, order date, or approximate time period
- Whether the user needs invoice, return, warranty, delivery, or reorder information
- Whether to inspect one known order or search order history

If the user already supplied enough context, proceed.

## Browser Access

Use the normal signed-in browser surface available in the current environment. Start from Amazon's order history and keep the same browser session when possible.

## Workflow

1. Search orders from Amazon order history using the user's supplied product, date, or recipient clues.
2. Open likely order details before presenting conclusions.
3. Capture order date, product title, order total if visible, delivery status, invoice availability, return eligibility, warranty/support clues, and reorder link availability.
4. Summarize only what was visible or directly inferred from the Amazon page state.

Read [references/order-workflow.md](references/order-workflow.md) for order-history paths, invoice/return checks, and recovery steps.

## Account Actions

Default to read-only inspection. Do not reorder, cancel, return, request support, message sellers, change addresses, download files outside the requested artifact, or start a claim unless the user explicitly asks for that exact action.

## Output Rules

- Say which order page or order search result was checked.
- Include dates and order identifiers only when visible.
- Separate confirmed facts from unavailable or not-visible details.
- If multiple plausible orders match, return a short candidate list and explain the distinguishing evidence.
