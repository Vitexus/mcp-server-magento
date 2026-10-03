# Changelog

## 1.0.0 - 2026-10-04
- Debian packaging: `mcp-server-magento` and `mcprack-mcp-server-magento`.
- Binary renamed to `mcp-server-magento`, with `--version` / `--help`.
- All tools have titles and MCP annotations; `MAGENTO_READ_ONLY=true` hides `update_product_attribute`.
- TLS verification now on by default (`MAGENTO_INSECURE_TLS=true` to disable); 30 s HTTP timeout; output size cap; API errors no longer expose the bearer token.
- MCP SDK bumped to 1.32.
