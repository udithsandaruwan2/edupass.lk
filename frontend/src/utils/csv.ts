function escape(value: unknown) {
  const s = value == null ? '' : String(value);
  // Prefix formula-like cells so spreadsheets don't execute them
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
}

export function downloadFile(filename: string, contents: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
