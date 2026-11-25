import { useCallback, useMemo, useState } from 'react';

function compare(a, b) {
  const aNil = a === null || a === undefined || a === '';
  const bNil = b === null || b === undefined || b === '';
  if (aNil && bNil) return 0;
  if (aNil) return 1;
  if (bNil) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Client-side sorting + pagination for any row array. Rows must be memoised by the caller. */
export default function useTableControls(rows, { initialSort = { key: null, dir: 'asc' }, initialPageSize = 10 } = {}) {
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => compare(a[sort.key], b[sort.key]) * dir);
  }, [rows, sort]);

  const maxPage = Math.max(0, Math.ceil(sorted.length / pageSize) - 1);
  const safePage = Math.min(page, maxPage);
  const pageRows = useMemo(
    () => sorted.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [sorted, safePage, pageSize],
  );

  const requestSort = useCallback((key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    setPage(0);
  }, []);
  const setPageSize = useCallback((n) => {
    setPageSizeState(n);
    setPage(0);
  }, []);

  return { sorted, pageRows, total: sorted.length, page: safePage, setPage, pageSize, setPageSize, sort, requestSort };
}
