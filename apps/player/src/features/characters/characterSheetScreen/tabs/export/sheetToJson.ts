import type { CharacterSheet } from '@tapestry/types';

export function downloadSheetJson(sheet: CharacterSheet): void {
  const filename = `${sheet.name.replace(/\s+/g, '-').toLowerCase()}-sheet.json`;
  const json = JSON.stringify(sheet, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
