# Order Workflow

## Entry Points

- Orders: `https://www.amazon.com/gp/css/order-history`
- Search orders from the order-history search field when available.
- Use year or time-period filters when the query is broad.

## Checks

- Open the order details page for every likely match before summarizing.
- For invoices, look for `Invoice`, `View invoice`, or printable order summary links.
- For returns, look for return-window text, `Return or replace items`, or unavailable return messaging.
- For warranties and support, inspect visible product support, seller support, or manufacturer support links.
- For reorder requests, identify whether a reorder or buy-again affordance is visible, but do not trigger it without explicit confirmation.

## Recovery

- If Amazon asks for sign-in or reauthentication, pause and ask the user to complete it in the browser.
- If search fails, try order-history filters and browser find with product, seller, recipient, or date clues.
- If several orders match, list candidates with visible dates and titles instead of guessing.
- If invoice or return status is not visible, say that it was not visible rather than inferring eligibility.
