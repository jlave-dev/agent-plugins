# Amazon Recovery

- Wrong product opens: re-extract heading and ASIN from the same result container, then verify the product-page title.
- Price differs: ignore search-result prices and use only the product-page purchase price.
- Missing price, rating, or review count: drop the item.
- CAPTCHA, 403, or empty results: wait about 60 seconds, return to `https://www.amazon.com`, retry once, then report rate limiting.
- Incomplete page: wait for visible text such as the search term, product title, or `Add to Cart`, then read the page again.
