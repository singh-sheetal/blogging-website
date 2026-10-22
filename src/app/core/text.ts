const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export const monthShort = (d: Date) => MONTHS[d.getMonth()];
export const yearShort = (d: Date) => `’${String(d.getFullYear()).slice(2)}`;
export const monthYear = (d: Date) =>
  d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
export const monthYearShort = (d: Date) =>
  d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

export function readingMinutes(content: string): number {
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Turns post content into paragraph HTML. Content that already contains markup is
 * returned as-is (Angular sanitises it on binding). Plain text is split on
 * line breaks; one long block is grouped into paragraphs of about three sentences.
 */
export function toHtml(content: string): string {
  const text = content.trim();
  if (!text) return '';
  if (/<\/?(p|br|div|h[1-6]|ul|ol|li)\b/i.test(text)) return text;

  let blocks = text.split(/\n\s*\n|\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 1 && blocks[0].length > 450) {
    const sentences = blocks[0].match(/[^.!?]+[.!?]+["”’']*\s*|[^.!?]+$/g) ?? [blocks[0]];
    blocks = [];
    let cur = '';
    let count = 0;
    for (const s of sentences) {
      cur += s;
      count++;
      if (count >= 3 && cur.length > 220) {
        blocks.push(cur.trim());
        cur = '';
        count = 0;
      }
    }
    if (cur.trim()) blocks.push(cur.trim());
  }
  return blocks.map((b) => `<p>${escapeHtml(b)}</p>`).join('');
}

/** Plain-text summary of post content (markup removed), cut at a word boundary, for meta descriptions. */
export function summary(content: string, max = 155): string {
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, '');
  return `${cut}…`;
}
