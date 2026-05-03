export type RulerMargins = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type ViewportRect = { x: number; y: number; w: number; h: number };

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function bitmapToPngDataUrl(bmp: ImageBitmap): Promise<string> {
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bmp, 0, 0);
  return c.toDataURL('image/png');
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
