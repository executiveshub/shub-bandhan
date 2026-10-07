/**
 * Utility to export tabular data to an Excel-compatible CSV file
 * Includes UTF-8 Byte Order Mark (\uFEFF) to guarantee correct rendering of
 * Hindi / Devanagari characters in Microsoft Excel.
 */

export interface ExportColumn {
  key: string;
  label: string;
}

export function exportToCsv(
  filename: string,
  rows: Record<string, any>[],
  columns?: ExportColumn[]
) {
  if (!rows || rows.length === 0) {
    alert('निर्यातक के लिए कोई डेटा उपलब्ध नहीं है (No data to export)');
    return;
  }

  // Determine columns
  const cols =
    columns ||
    Object.keys(rows[0]).map((k) => ({
      key: k,
      label: k,
    }));

  // Build CSV header
  const headerLine = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');

  // Build data rows
  const dataLines = rows.map((row) => {
    return cols
      .map((col) => {
        let val = row[col.key];
        if (val === undefined || val === null) {
          val = '';
        } else if (typeof val === 'boolean') {
          val = val ? 'हाँ (Yes)' : 'नहीं (No)';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  // UTF-8 BOM + Header + Rows
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${filename.replace(/\.csv$/, '')}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
