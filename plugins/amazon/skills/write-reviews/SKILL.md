---
name: write-reviews
description: Use when the user asks to draft, refine, or submit an Amazon product review for a purchased item. Verifies the product/order context when possible, drafts in the user's requested tone, and submits only after explicit user approval.
---

# Write Reviews

Draft or submit Amazon product reviews from purchased items.

## Requirements Gate

Before drafting or browser automation, ask directly for any missing review inputs:

- Product or order to review
- Rating or sentiment
- Main pros, cons, use case, and time used
- Whether the user wants a draft only or wants help submitting after review

If the user already supplied enough inputs, proceed.

## Browser Access

Use the normal signed-in browser surface available in the current environment when verifying purchased-item context or opening the Amazon review form.

## Workflow

1. Identify the product or order being reviewed.
2. Verify purchase context when possible from the product page, order history, or review form.
3. Draft a concise, specific review grounded in the user's experience.
4. If the user wants submission help, place the draft in the review form and stop for explicit approval before submitting.
5. Submit only after the user confirms the final visible review content and rating.

Review forms may start from a product page or order details and may require stars, title, body, media, or feature ratings. Keep drafts grounded in the user's actual experience; do not invent usage or make medical/legal guarantees. Fill only approved content, stop before final submission unless already approved, verify the thank-you/submitted state after submission, and report sign-in or non-reviewable blockers.

## Account Actions

Do not submit, edit, or delete a review unless the user explicitly approves that exact action after seeing the final content. Drafting is allowed without submission approval.

## Output Rules

- For drafts, provide the review text and a suggested star rating if requested.
- For browser-assisted submissions, report whether the review was drafted, submitted, or blocked.
- After approved submission, verify the final submitted or thank-you state before saying it was submitted.
