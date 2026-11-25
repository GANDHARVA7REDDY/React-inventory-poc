# Inventory Management System — React POC

Frontend-only inventory application (products, categories, suppliers, stock in/out/adjustment, history,
low-stock alerts, reports, CSV export). All data lives in browser `localStorage`; there is no backend.

**Stack:** React 18 · JavaScript · Vite · MUI (Material UI) · React Router · Recharts (MIT) · React Hooks

## Run it

Requires Node.js 18+ (20 or 22 recommended).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 38 automated business-rule tests (no extra dependencies)
npm run build      # production build into dist/
```

On first launch the app seeds 5 categories, 5 suppliers, 23 products (one inactive) and 61 transactions
(23 opening + 38 movements). Sample data is written **only once**; later loads never overwrite saved records.

To reset to the sample data, clear this site's storage in the browser dev tools (Application → Local Storage),
then reload.

## Responsive behaviour

- ≥ 900 px: permanent sidebar. Below that: the sidebar becomes a slide-over drawer (hamburger button).
- KPI cards, forms and filter bars use CSS-grid `auto-fit` columns, so they reflow from 1 to 6 columns.
- Tables scroll horizontally inside their card and hide low-priority columns on narrower screens.
- Dashboard chart is a horizontal bar chart so category names stay readable on phones.

## Project structure

```
src/
  domain/        Pure business logic (no React): constants, stock rules, validators, commands, seed, reports, CSV
  services/      storage.js — localStorage wrapper (corruption handling, rollback, backup)
  context/       InventoryContext (state + persistence), NotificationProvider (snackbars)
  hooks/         useTableControls (sort + pagination), useSubmitGuard (double-submit protection)
  components/    Layout, DataTable, FilterBar, ProductSelect, StatCard, ConfirmDialog, MasterDataManager, ...
  pages/         One file per screen (Dashboard, ProductList, ProductForm, ProductDetails, ...)
tests/           node:test suite exercising the domain layer
docs/            Submission documents (see below)
```

## Documents

| # | File |
|---|------|
| 1 | [Requirement understanding](docs/01-requirement-understanding.md) |
| 2 | [Screen navigation flow](docs/02-navigation-flow.md) (+ `navigation-flow.png`) |
| 3 | [Components and data storage](docs/03-components-and-data-storage.md) |
| 4 | [Test cases with results](docs/04-test-cases.md) |
| 5 | [Known issues and incomplete items](docs/05-known-issues.md) |
| 6 | [Assumptions and clarifications](docs/06-assumptions.md) |

## Routes

`/` Dashboard · `/products` · `/products/new` · `/products/:id` · `/products/:id/edit` · `/categories` ·
`/suppliers` · `/stock-in` · `/stock-out` · `/stock-adjustment` · `/transactions` ·
`/reports/current-stock` · `/reports/movement` · `/reports/low-stock`
