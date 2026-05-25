<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into this Next.js App Router e-commerce project. PostHog is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.js` to route analytics traffic through `/ingest`. Thirteen custom events span the full shopping journey — product discovery, search and filtering, add-to-cart, checkout initiation, order placement, and post-order actions. Exception capture (`posthog.captureException`) is active in the checkout error path for automatic error tracking. Environment variables are set in `.env.local` and referenced via `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.

| Event | Description | File |
|---|---|---|
| `product_viewed` | Fired when a product detail page finishes loading — top of conversion funnel | `src/app/products/[slug]/page.tsx` |
| `product_added_to_cart` | Fired when user clicks Add to Cart | `src/app/products/[slug]/page.tsx` |
| `featured_product_clicked` | Fired when user clicks a featured product card on the homepage | `src/app/page.tsx` |
| `cart_item_removed` | Fired when user removes an item from the cart | `src/app/cart/page.tsx` |
| `cart_item_quantity_updated` | Fired when user changes item quantity in the cart | `src/app/cart/page.tsx` |
| `checkout_initiated` | Fired when user clicks the checkout button from the cart page | `src/app/cart/page.tsx` |
| `order_placed` | Fired when an order is successfully submitted | `src/app/checkout/page.tsx` |
| `checkout_error` | Fired when an order submission fails (order_failed or network_error) | `src/app/checkout/page.tsx` |
| `product_search_submitted` | Fired when user submits a search query on the catalog page | `src/app/products/page.tsx` |
| `category_filter_applied` | Fired when user selects a category filter | `src/app/products/page.tsx` |
| `filters_cleared` | Fired when user clears all active filters | `src/app/products/page.tsx` |
| `order_confirmation_viewed` | Fired when the thank-you page renders after a successful order | `src/app/thank-you/page.tsx` |
| `continue_shopping_clicked` | Fired when user clicks Continue Shopping on the thank-you page | `src/app/thank-you/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1617345)
- [Purchase Conversion Funnel](/insights/lPiPNJr5) — Drop-off at each step: Product Viewed → Added to Cart → Checkout Started → Order Placed
- [Orders Placed Over Time](/insights/2hgwbSLz) — Daily trend of successfully completed orders
- [Cart Activity](/insights/JOXSIyuR) — Add to cart vs remove from cart — shopping intent and friction signal
- [Checkout Errors](/insights/MVvU1u78) — Daily trend of failed order submissions to monitor reliability
- [Search & Filter Activity](/insights/aNfvisjZ) — Search submissions and category filter usage to understand product discovery

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
