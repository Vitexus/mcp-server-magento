---
name: magento-store-queries
description: Query a Magento 2 store through the mcp-server-magento MCP server -- find products by SKU/ID, check stock, categories and attributes, and report order counts, revenue (optionally per country) and product sales for date ranges like "last week" or "YTD". Use when a user asks about Magento products, stock, orders or revenue.
---

# Magento store queries

Uses the tools of `mcp-server-magento` (https://github.com/Vitexus/mcp-server-magento).

- Product questions: `get_product_by_sku`, `get_product_by_id`, `search_products`, `advanced_product_search`, `get_product_stock`, `get_product_categories`, `get_related_products`, `get_product_attributes`.
- Sales questions: `get_order_count`, `get_revenue`, `get_revenue_by_country`, `get_product_sales`, `get_customer_ordered_products_by_email`. Date arguments accept `today`, `yesterday`, `this week`, `last month`, `YTD` or explicit dates.
- `update_product_attribute` changes live store data: confirm SKU, attribute and new value with the user first. It is absent when the server runs with `MAGENTO_READ_ONLY=true`.
