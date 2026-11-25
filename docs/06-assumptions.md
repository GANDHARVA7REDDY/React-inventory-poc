# 6. Assumptions and Clarifications

| # | Topic | Assumption |
|---|---|---|
| 1 | Opening stock | Stored as an *Opening* transaction (also appears in history) so stock = sum of transactions |
| 2 | Dashboard scope | KPIs, chart and alerts count **active** products only; "Today's Transactions" excludes Opening rows and uses the browser's local day |
| 3 | Dates | Transaction and adjustment dates are system generated at save time and read-only |
| 4 | Codes | Product, category and supplier codes are compared case-insensitively; category and supplier codes are locked after creation (like product code) |
| 5 | Product code format | Any text up to 20 characters; trimmed |
| 6 | Numbers | Quantities, reorder level, opening stock: whole numbers. Unit cost: > 0 with up to 2 decimals. Currency shown as INR |
| 7 | Inactive references | Editing an existing product keeps its current supplier even if later deactivated; a new selection must be active. A product cannot be re-activated while its category is inactive |
| 8 | Adjustments | Actual stock equal to system stock is rejected (nothing to adjust). Inactive products cannot be adjusted (BR-011) |
| 9 | Transaction reference | `Transaction ID` is auto-generated (`TXN-000123`). The optional "Reference Number" on Stock In is stored in the Reference column; Stock Out/Adjustment show "—" |
| 10 | Report filters | Current Stock report defaults to active products; Low Stock report always excludes inactive products |
| 11 | Sample data | 23 products (1 inactive), 23 opening + 38 movement transactions, covering In/Low/Out of stock |
| 12 | Corrupted data | Never auto-overwritten; user chooses retry, download raw data, or back up and reset |
| 13 | Charts | Recharts (MIT licence, free for commercial use) |
| 14 | Browsers | Current Chrome, Edge, Firefox, Safari |
