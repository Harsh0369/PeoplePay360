export function downloadCSV(filename: string, data: any[]) {
  if (!data || !data.length) return;

  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(','), // Header row
    ...data.map(item =>
      keys.map(key => {
        let value = item[key];
        if (value === null || value === undefined) value = '';
        value = String(value);
        // Escape quotes and wrap in quotes if there are commas, quotes, or newlines
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
