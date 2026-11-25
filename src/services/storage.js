import { STORAGE_KEYS } from '../domain/constants.js';

const ARRAY_KEYS = ['products', 'categories', 'suppliers', 'transactions'];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Light structural checks so that a hand-edited or truncated value is detected instead of crashing the UI. */
const SHAPES = {
  products: (r) => isObject(r) && typeof r.id === 'string' && typeof r.code === 'string' && typeof r.name === 'string'
    && typeof r.unitCost === 'number' && typeof r.reorderLevel === 'number',
  categories: (r) => isObject(r) && typeof r.id === 'string' && typeof r.code === 'string' && typeof r.name === 'string',
  suppliers: (r) => isObject(r) && typeof r.id === 'string' && typeof r.code === 'string' && typeof r.name === 'string',
  transactions: (r) => isObject(r) && typeof r.id === 'string' && typeof r.productId === 'string'
    && typeof r.quantityChange === 'number' && typeof r.timestamp === 'string' && !Number.isNaN(Date.parse(r.timestamp)),
};

export function entriesFromState(state) {
  return Object.keys(STORAGE_KEYS).map((k) => [STORAGE_KEYS[k], state[k]]);
}

/**
 * Thin wrapper around localStorage (injectable for tests).
 *  - loadAll(): never throws and never writes. It reports first-run, ok, or errors.
 *  - saveMany(): writes several keys as a unit; if any write fails the earlier ones are rolled back.
 */
export function createStorage(backend) {
  let store = backend;
  if (store === undefined) {
    try {
      store = globalThis.localStorage ?? null;
    } catch {
      store = null; // access can throw (blocked cookies / privacy modes)
    }
  }

  function read(key) {
    return store.getItem(key);
  }

  function loadAll() {
    if (!store) return { status: 'unavailable', errors: [{ key: '*', reason: 'Browser storage is not available.' }] };
    const raws = {};
    try {
      for (const name of Object.keys(STORAGE_KEYS)) raws[name] = read(STORAGE_KEYS[name]);
    } catch (err) {
      return { status: 'unavailable', errors: [{ key: '*', reason: `Browser storage cannot be read (${err.message}).` }] };
    }

    if (Object.values(raws).every((v) => v === null)) return { status: 'first-run', data: null, errors: [] };

    const data = {};
    const errors = [];
    for (const name of Object.keys(STORAGE_KEYS)) {
      const key = STORAGE_KEYS[name];
      if (raws[name] === null) {
        errors.push({ key, reason: 'Saved data is missing.' });
        continue;
      }
      let parsed;
      try {
        parsed = JSON.parse(raws[name]);
      } catch {
        errors.push({ key, reason: 'Saved data is not valid JSON (corrupted).' });
        continue;
      }
      if (ARRAY_KEYS.includes(name)) {
        if (!Array.isArray(parsed) || !parsed.every(SHAPES[name])) {
          errors.push({ key, reason: 'Saved data has an unexpected structure.' });
          continue;
        }
      } else if (!isObject(parsed)) {
        errors.push({ key, reason: 'Saved data has an unexpected structure.' });
        continue;
      }
      data[name] = parsed;
    }
    return errors.length ? { status: 'error', data: null, errors, raws } : { status: 'ok', data, errors: [] };
  }

  function saveMany(entries) {
    if (!store) return { ok: false, error: 'Browser storage is not available.' };
    const previous = [];
    try {
      for (const [key, value] of entries) {
        previous.push([key, store.getItem(key)]);
        store.setItem(key, JSON.stringify(value));
      }
      return { ok: true };
    } catch (err) {
      for (const [key, old] of previous.reverse()) {
        try {
          if (old === null) store.removeItem(key);
          else store.setItem(key, old);
        } catch {
          /* best effort rollback */
        }
      }
      const quota = err && (err.name === 'QuotaExceededError' || err.code === 22);
      return { ok: false, error: quota ? 'Browser storage is full.' : err.message || 'Unknown storage error.' };
    }
  }

  /** Copies every raw inventory value into one backup key before a destructive reset. */
  function backupRaw() {
    if (!store) return { ok: false, error: 'Browser storage is not available.' };
    try {
      const snapshot = {};
      for (const key of Object.values(STORAGE_KEYS)) snapshot[key] = store.getItem(key);
      const backupKey = `inventory_backup_${Date.now()}`;
      store.setItem(backupKey, JSON.stringify(snapshot));
      return { ok: true, key: backupKey, snapshot };
    } catch (err) {
      return { ok: false, error: err.message || 'Could not create a backup.' };
    }
  }

  function rawSnapshot() {
    const snapshot = {};
    try {
      for (const key of Object.values(STORAGE_KEYS)) snapshot[key] = store ? store.getItem(key) : null;
    } catch {
      /* ignore */
    }
    return snapshot;
  }

  function clearInventoryKeys() {
    try {
      for (const key of Object.values(STORAGE_KEYS)) store.removeItem(key);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return { loadAll, saveMany, backupRaw, rawSnapshot, clearInventoryKeys };
}
