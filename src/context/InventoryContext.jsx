import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { generateSeedData } from '../domain/seed.js';
import { buildProductViews, computeStockMap } from '../domain/stock.js';
import { STORAGE_KEYS } from '../domain/constants.js';
import { createStorage, entriesFromState } from '../services/storage.js';
import DataErrorScreen from '../components/DataErrorScreen.jsx';

const InventoryContext = createContext(null);

/** Loads saved data; seeds sample data ONLY on first run (BR-016). Never writes when saved data is damaged. */
function bootstrap(store) {
  const loaded = store.loadAll();
  if (loaded.status === 'first-run') {
    const seed = generateSeedData();
    const saved = store.saveMany(entriesFromState(seed));
    if (!saved.ok) {
      return { status: 'error', kind: 'unavailable', errors: [{ key: '*', reason: `Sample data could not be saved: ${saved.error}` }] };
    }
    return { status: 'ok', state: seed };
  }
  if (loaded.status === 'ok') return { status: 'ok', state: loaded.data };
  return { status: 'error', kind: loaded.status, errors: loaded.errors };
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function InventoryProvider({ children, storage }) {
  const store = useMemo(() => storage || createStorage(), [storage]);
  const [boot, setBoot] = useState(() => bootstrap(store));
  const [state, setState] = useState(boot.state || null);
  const stateRef = useRef(state);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  const apply = useCallback((b) => {
    setBoot(b);
    stateRef.current = b.state || null;
    setState(b.state || null);
  }, []);

  /**
   * Runs a business command against the latest state. State is only replaced after the
   * browser storage write succeeds, so memory and storage cannot drift apart.
   */
  const run = useCallback((command, ...args) => {
    if (!stateRef.current) return { ok: false, errors: {}, message: 'Inventory data is not available.', code: 'NO_DATA' };
    const result = command(stateRef.current, ...args);
    if (!result.ok) return result;
    const saved = store.saveMany(result.changed.map((k) => [STORAGE_KEYS[k], result.state[k]]));
    if (!saved.ok) {
      return { ok: false, errors: {}, code: 'STORAGE', message: `Changes were not saved: ${saved.error}` };
    }
    stateRef.current = result.state;
    setState(result.state);
    return result;
  }, [store]);

  // Keep several open tabs consistent: another tab's save re-syncs this one.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key && !Object.values(STORAGE_KEYS).includes(e.key)) return;
      const loaded = store.loadAll();
      if (loaded.status === 'ok') {
        stateRef.current = loaded.data;
        setState(loaded.data);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [store]);

  const derived = useMemo(() => {
    if (!state) return null;
    const stockMap = computeStockMap(state.transactions);
    const productViews = buildProductViews(state, stockMap);
    return {
      stockMap,
      productViews,
      productViewById: new Map(productViews.map((v) => [v.id, v])),
      productsById: new Map(state.products.map((p) => [p.id, p])),
      categoryById: new Map(state.categories.map((c) => [c.id, c])),
      supplierById: new Map(state.suppliers.map((s) => [s.id, s])),
    };
  }, [state]);

  const value = useMemo(() => (state ? { ...state, ...derived, run } : null), [state, derived, run]);

  if (boot.status !== 'ok' || !value) {
    return (
      <DataErrorScreen
        kind={boot.kind}
        errors={boot.errors || []}
        message={recoveryMessage}
        onRetry={() => { setRecoveryMessage(''); apply(bootstrap(store)); }}
        onDownload={() => download(`inventory-raw-data-${Date.now()}.json`, JSON.stringify(store.rawSnapshot(), null, 2))}
        onReset={() => {
          const backup = store.backupRaw();
          if (!backup.ok) {
            setRecoveryMessage(`Reset cancelled: a backup could not be created (${backup.error}). Download the raw data instead.`);
            return;
          }
          const cleared = store.clearInventoryKeys();
          if (!cleared.ok) {
            setRecoveryMessage(`Reset failed: ${cleared.error}`);
            return;
          }
          setRecoveryMessage(`A backup was kept in browser storage under "${backup.key}".`);
          apply(bootstrap(store));
        }}
      />
    );
  }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider');
  return ctx;
}
