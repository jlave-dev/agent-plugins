# ASIN Extraction

Extract the ASIN from the product link inside the same result container as the product heading.

Valid forms:

- `/dp/B0XXXXXXXXX`
- `/gp/product/B0XXXXXXXXX`
- redirected Amazon URLs after following the redirect

Never pair independent lists of headings and ASINs. Search pages include sponsored and unrelated links.

Verify each candidate at `https://www.amazon.com/dp/<ASIN>` and discard it if the product-page title differs.
