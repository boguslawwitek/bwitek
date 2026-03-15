/** Escape HTML special characters to prevent XSS */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Sanitize email header value - strip newlines to prevent header injection */
export function sanitizeEmailHeader(value: string): string {
  return value.replace(/[\r\n]/g, '').trim();
}

/** Validate URL has safe protocol (http/https only) */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/** Get file extension from validated MIME type */
export function extFromMime(mime: string): string {
  return MIME_TO_EXT[mime] || '.bin';
}

/** Magic bytes signatures for allowed image types */
const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], },
];

/** Validate that buffer content matches the claimed MIME type */
export function validateMagicBytes(buffer: Buffer, claimedMime: string): boolean {
  const sig = MAGIC_BYTES.find(s => s.mime === claimedMime);
  if (!sig) return false;

  if (buffer.length < sig.bytes.length) return false;

  for (let i = 0; i < sig.bytes.length; i++) {
    if (buffer[i] !== sig.bytes[i]) return false;
  }

  // Extra check for WebP: bytes 8-11 must be "WEBP"
  if (claimedMime === 'image/webp') {
    if (buffer.length < 12) return false;
    const webp = [0x57, 0x45, 0x42, 0x50];
    for (let i = 0; i < 4; i++) {
      if (buffer[8 + i] !== webp[i]) return false;
    }
  }

  return true;
}
