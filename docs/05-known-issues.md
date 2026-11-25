# 5. Known Issues and Incomplete Items

1. **UI not executed in a browser by the author of this build.** The build environment had no network access, so
   `npm install` could not run. The UI sources were checked by bundling (syntax, imports and exports resolve) and the
   business logic is fully unit-tested, but the screens themselves have not been seen. Expect to run `npm install`,
   `npm run dev`, click through the AC table in `04-test-cases.md`, and fix any small visual/runtime defects.
2. **Screenshots are not included** (same reason). Capture them after running the app (Submission item 6).
3. Dependency versions are ranges (`^`) chosen without being able to install them; if MUI/React Router majors have
   moved on, `npm install` still resolves to the same major versions.
4. Adjustment Date and Transaction Date are always "now" and read-only; back-dated entries are not supported.
5. Transaction History export and sorting act on the whole filtered set, not only the current page (intended).
6. Two tabs: changes made in another tab are picked up through the `storage` event; a simultaneous save in two tabs
   in the same instant could still lose one write (localStorage has no locking) — acceptable for a POC.
7. localStorage (~5 MB) is not suitable for secure, shared or large production inventory data.
8. Not implemented (out of scope per spec): backend, authentication, purchase orders, barcodes, multi-warehouse,
   GST, e-mail/SMS notifications, deployment.
