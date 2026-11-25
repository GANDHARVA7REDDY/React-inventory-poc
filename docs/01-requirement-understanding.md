# 1. Requirement Understanding

## Goal
Replace manual / Excel stock tracking with a single-page React application that manages master data
(products, categories, suppliers), records every stock movement, derives available quantities from those
movements, alerts on low stock, and reports/export inventory data. Persistence is browser `localStorage`
only; no backend, authentication, purchase orders, GST or multi-warehouse support.

## Entities

| Entity | Key fields | Notes |
|---|---|---|
| Category | code (unique), name (unique, case-insensitive), description, status | Cannot be deactivated while used by an active product |
| Supplier | code (unique), name, contact person, email (valid if given), phone, status | Inactive supplier cannot be chosen for new products or receipts |
| Product | code (unique, immutable), name, category, supplier, unit, unit cost, opening stock (immutable), reorder level, status | Never deleted, only deactivated (history preserved) |
| Transaction | id, timestamp, product, type (Opening / Stock In / Stock Out / Adjustment), quantity change (signed), balance after, reference, remarks (+ supplier & unit cost for receipts, issued-to / department / purpose for issues, reason for adjustments) | Immutable once saved |
| Settings | schema version, seeded-at, currency | Marks that sample data was loaded |

## Core rules (how each is realised)

| Rule | Implementation |
|---|---|
| Available Stock = Opening + In − Out + Net Adjustments | Opening stock is written as an *Opening* transaction at product creation. Stock is always the **sum of signed transaction quantities** — it is never stored, so it cannot drift (FR-015) |
| Status: 0 → Out, ≤ reorder → Low, else In | `getStockStatus()` in `domain/stock.js` |
| Inventory value = stock × master unit cost | Receipt unit cost is only recorded on the transaction |
| Shortfall = max(0, reorder − stock) | `calcShortfall()` |
| Stock Out ≤ available; no negative balance | Validated in `validateStockOut` and re-checked in the command (BR-006, BR-008) |
| Adjustment = physical − system, reason mandatory | User enters physical count; difference computed and stored |
| Transactions immutable | There is no edit/delete command; the lock button in History reports the refusal (BR-010) |
| Inactive products | Excluded from dashboard KPIs, alerts, low-stock report; blocked from new transactions; history kept |
| Seed once | Seed only when **all** storage keys are absent (first run) |
| Corrupted data | App shows a recovery screen; nothing is overwritten automatically |

## Screens (INV-01 … INV-12)
Dashboard · Product List · Add/Edit Product · Product Details · Categories · Suppliers · Stock In ·
Stock Out · Stock Adjustment · Transaction History · Low Stock Report · Inventory Reports. Related screens
are combined: Add/Edit uses one form; Categories/Suppliers use dialogs; the three reports share one tabbed page.

## Non-functional
Responsive (desktop, tablet and phone), validation before every save, duplicate-submit protection, accessible
labels, no unsafe HTML rendering, CSV formula-injection guard, performance verified for 100+ products /
500+ transactions (automated test).
