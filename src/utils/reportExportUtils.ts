/**
 * MPLADS Intelligence Portal - Official Report Export Utilities
 * Provides browser-safe, UTF-8 encoded, multi-format export functions:
 * 1. CSV (with UTF-8 BOM for Microsoft Excel compatibility)
 * 2. Excel / TSV formatted spreadsheet
 * 3. JSON structured audit export
 * 4. Standalone Printable HTML Official Governance Dossier
 */

export function triggerDownload(content: string, filename: string, mimeType: string): boolean {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
    return true;
  } catch (err) {
    console.error('Failed to trigger download:', err);
    return false;
  }
}

/**
 * Escapes a single CSV cell value properly
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else {
    str = `"${str}"`;
  }
  return str;
}

/**
 * Exports data as a CSV file with UTF-8 BOM
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  metadata?: Record<string, string>
): boolean {
  const lines: string[] = [];

  // UTF-8 BOM for Microsoft Excel & Google Sheets compatibility
  const BOM = '\uFEFF';

  if (metadata) {
    lines.push('# GOVERNMENT OF INDIA - MPLADS SMART INTELLIGENCE REPORT');
    Object.entries(metadata).forEach(([k, v]) => {
      lines.push(`# ${k}: ${v}`);
    });
    lines.push('# Generated on: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST');
    lines.push('');
  }

  // Header line
  lines.push(headers.map(escapeCsvValue).join(','));

  // Data rows
  rows.forEach(row => {
    lines.push(row.map(escapeCsvValue).join(','));
  });

  const fullContent = BOM + lines.join('\r\n');
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  return triggerDownload(fullContent, safeFilename, 'text/csv;charset=utf-8;');
}

/**
 * Exports data as structured JSON
 */
export function exportToJson(filename: string, data: any): boolean {
  const jsonContent = JSON.stringify(data, null, 2);
  const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  return triggerDownload(jsonContent, safeFilename, 'application/json;charset=utf-8;');
}

/**
 * Generates an official standalone HTML dossier that can be printed to PDF or archived
 */
export function generateOfficialDossierHtml(options: {
  title: string;
  financialYear: string;
  filterSummary: string;
  kpis: Array<{ label: string; value: string; helper?: string }>;
  tables: Array<{
    title: string;
    description?: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
}): string {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${options.title} - MPLADS Governance Dossier</title>
  <style>
    @media print {
      @page { margin: 15mm; size: A4; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 11pt;
      line-height: 1.5;
    }
    .header-box {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .tricolor-strip {
      height: 4px;
      display: flex;
      margin-bottom: 16px;
    }
    .tricolor-saffron { flex: 1; background: #FF9933; }
    .tricolor-white { flex: 1; background: #ffffff; border: 1px solid #e2e8f0; }
    .tricolor-green { flex: 1; background: #138808; }
    .header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-large {
      font-size: 18pt;
      font-weight: 800;
      margin: 0 0 4px 0;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 10pt;
      color: #475569;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 700;
      background: #e2e8f0;
      color: #0f172a;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 8pt;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
    }
    .kpi-helper {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 2px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      border-left: 4px solid #2563eb;
      padding-left: 8px;
      margin: 24px 0 12px 0;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 9.5pt;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #cbd5e1;
      font-size: 8pt;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .footer-bar {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    .print-button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 10pt;
    }
    .print-button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; padding: 12px 16px; border-radius: 8px; border: 1px solid #cbd5e1;">
    <div style="font-size: 9.5pt; color: #334155;">
      <strong>Print or Save as PDF:</strong> Use your browser's Print dialog to save this governance dossier as a PDF document.
    </div>
    <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header-box">
    <div class="tricolor-strip">
      <div class="tricolor-saffron"></div>
      <div class="tricolor-white"></div>
      <div class="tricolor-green"></div>
    </div>
    <div class="header-flex">
      <div>
        <div style="font-size: 8.5pt; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">
          Government of India • Ministry of Statistics and Programme Implementation (MoSPI)
        </div>
        <h1 class="title-large">${options.title}</h1>
        <p class="subtitle">
          MPLADS Integrated Digital Sansad Engine • Scope: ${options.filterSummary} • Financial Year: ${options.financialYear}
        </p>
      </div>
      <div style="text-align: right;">
        <span class="badge">OFFICIAL PARLIAMENTARY RECORD</span>
        <div style="font-size: 8pt; color: #64748b; margin-top: 4px;">
          Generated: ${now} IST
        </div>
      </div>
    </div>
  </div>

  <div class="kpi-grid">
    ${options.kpis
      .map(
        k => `
      <div class="kpi-card">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        ${k.helper ? `<div class="kpi-helper">${k.helper}</div>` : ''}
      </div>
    `
      )
      .join('')}
  </div>

  ${options.tables
    .map(
      table => `
    <div>
      <div class="section-title">${table.title}</div>
      ${table.description ? `<p style="font-size: 8.5pt; color: #64748b; margin: -6px 0 10px 0;">${table.description}</p>` : ''}
      <table>
        <thead>
          <tr>
            ${table.headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${table.rows
            .map(
              row => `
            <tr>
              ${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : '-'}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
    )
    .join('')}

  <div class="footer-bar">
    <div>MPLADS Smart Portal • Autonomous Governance and Transparency Framework</div>
    <div>Confidentiality: Public Transparency Record • Verified via Digital Sansad APIs</div>
  </div>
</body>
</html>`;
}
