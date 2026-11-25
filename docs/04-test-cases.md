# 4. Test Cases and Results

**Legend**
- **Pass (auto)**: verified by `npm test` (38 tests, all passing) against the business-logic layer the screen calls.
- **Manual**: needs a person to click through in the browser. **Not yet executed** — the UI could not be run in the
  environment where this project was generated (package installs were blocked), so these are the checks to perform
  before submission. Fill in Pass/Fail.

| ID | Scenario | Expected | Logic layer | UI (browser) |
|---|---|---|---|---|
| AC-01 | First open | Sample inventory loads | Pass (auto) | Manual |
| AC-02 | Add valid product | Appears in list | Pass (auto) | Manual |
| AC-03 | Duplicate product code | Save blocked | Pass (auto) | Manual |
| AC-04 | Missing required fields | Errors shown | Pass (auto) | Manual |
| AC-05 | Edit product | Record updated; code/opening stock unchanged | Pass (auto) | Manual |
| AC-06 | Create category | Available in product form | Pass (auto) | Manual |
| AC-07 | Create supplier | Available in Stock In / product form | Pass (auto) | Manual |
| AC-08 | Receive 10 units | Stock +10 | Pass (auto) | Manual |
| AC-09 | Issue 5 units | Stock −5 | Pass (auto) | Manual |
| AC-10 | Issue more than available | Blocked | Pass (auto) | Manual |
| AC-11 | Zero / negative issue quantity | Validation shown | Pass (auto) | Manual |
| AC-12 | Adjust to physical count | Correct signed adjustment (25→22 = −3) | Pass (auto) | Manual |
| AC-13 | Stock reaches zero | Out of Stock | Pass (auto) | Manual |
| AC-14 | Stock ≤ reorder level | Low Stock | Pass (auto) | Manual |
| AC-15 | Update stock | Dashboard recalculates | Pass (auto) | Manual |
| AC-16 | View history | Movements accurate | Pass (auto) | Manual |
| AC-17 | Product filters | Correct products | Pass (auto) | Manual |
| AC-18 | Change page size (5/10/20) | Correct record count | n/a (UI hook) | Manual |
| AC-19 | Export stock report | CSV with correct values | Pass (auto) | Manual |
| AC-20 | Refresh | Records remain | Pass (auto, storage reload) | Manual |
| AC-21 | Deactivate product | New transactions blocked, history kept | Pass (auto) | Manual |
| AC-22 | Open nonexistent product (`/products/xyz`) | Friendly message | n/a (UI) | Manual |
| AC-23 | Change a historical transaction | Prevented (lock button shows message) | Pass (auto) | Manual |
| AC-24 | Deactivate category in use | Blocked | Pass (auto) | Manual |
| AC-25 | Filter report then export | Export equals filtered rows | Pass (auto) | Manual |

## Additional automated checks (all Pass)
Seed minimums and internal consistency; spec example 20+15−8−2 = 25; status thresholds incl. reorder level 0;
inactive products excluded from KPIs/alerts; adjustment cannot go negative; failed commands leave state untouched;
CSV escaping and formula-injection guard; corrupted/missing/unavailable storage detection without overwriting;
multi-key write rollback; 100 products + 600 transactions compute in well under 200 ms.

## Manual responsive checks (not yet executed)
Resize the browser to ~1280, ~820 (tablet) and ~390 px (phone): sidebar becomes a drawer below 900 px; no page-level
horizontal scrolling; tables scroll inside their card; forms and KPI cards reflow; dashboard chart stays readable.
