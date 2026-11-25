# 3. Components and Data Storage

## Components

| Component / module | Responsibility |
|---|---|
| `App.jsx` | Routes; wraps the app in NotificationProvider and InventoryProvider |
| `Layout` | Sidebar (active item highlighted), header with page title, responsive drawer |
| `InventoryProvider` / `useInventory` | Holds state, derives stock/product views, exposes `run(command, ...args)` which persists before updating state; syncs other tabs via the `storage` event |
| `NotificationProvider` / `useNotify` | MUI Snackbar + Alert messages |
| `DataErrorScreen` | Recovery screen for missing/corrupted/unavailable storage (retry, download raw data, back up and reset) |
| `DataTable` + `useTableControls` | Sortable, paginated (5/10/20) table with responsive column hiding |
| `FilterBar` | Responsive filter grid with Clear Filters |
| `ProductSelect` | Searchable product dropdown (Autocomplete) |
| `MasterDataManager` | Shared list + dialog + activate/deactivate used by Categories and Suppliers |
| `StatCard`, `StatusChip`, `PageHeader`, `ConfirmDialog`, `NotFoundMessage` | Reusable UI pieces |
| `useSubmitGuard` | Ignores a second submit while one is in progress |
| Pages | Dashboard, ProductList, ProductForm, ProductDetails, Categories, Suppliers, StockIn, StockOut, StockAdjustment, Transactions, Reports (3 tabs), NotFound |
| `domain/commands.js` | Pure business operations (create/update product, status changes, stock in/out/adjust) |
| `domain/validators.js` | All field and business-rule validation |
| `domain/stock.js` | Stock map, status, shortfall, value, dashboard summary |
| `domain/reports.js`, `domain/csv.js` | Filters, report columns, CSV generation |
| `domain/seed.js` | First-run sample data |
| `services/storage.js` | localStorage access with validation, rollback and backup |

## Data storage

| Key | Content |
|---|---|
| `inventory_products` | Product records |
| `inventory_categories` | Category records |
| `inventory_suppliers` | Supplier records |
| `inventory_transactions` | Opening, Stock In, Stock Out and Adjustment rows (adjustments live here) |
| `inventory_settings` | `{ schemaVersion, seededAt, currency }` |
| `inventory_backup_<timestamp>` | Only created if the user chooses "Back up & reset" on the recovery screen |

### Consistency design
- **Stock is derived, never stored.** `Available = Σ quantityChange` over the product's transactions, where the
  product's opening stock is an *Opening* transaction. Dashboard, lists, reports and forms all read the same
  derived map, so they cannot disagree.
- Each transaction also stores `balanceAfter` (a snapshot for the history screen and audit).
- Every command returns a new state only when valid. `run()` writes to localStorage first; **state is updated only if
  the write succeeds**. Multi-key writes (new product = product + opening transaction) are rolled back if the second
  write fails.
- Load never writes. First run (all keys absent) seeds; anything else must parse and pass shape checks, otherwise
  the recovery screen is shown and the raw values stay untouched.
- Transaction ids are `TXN-000001…`, generated as max + 1.
