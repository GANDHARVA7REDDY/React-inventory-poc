// Cells that start with these characters can be executed as formulas by Excel.
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  // Neutralise CSV/formula injection for user-entered text (numbers are left untouched).
  if (typeof value === 'string' && FORMULA_START.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** columns: [{ header, value: (row) => any }] */
export function toCsv(columns, rows) {
  const head = columns.map((c) => cell(c.header)).join(',');
  const lines = rows.map((r) => columns.map((c) => cell(c.value(r))).join(','));
  return [head, ...lines].join('\r\n');
}

export function downloadCsv(filename, csv) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
