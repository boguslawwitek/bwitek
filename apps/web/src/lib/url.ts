export function getFullImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`;
  }
  if (url.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}/api${url}`;
  }
  return url;
}
