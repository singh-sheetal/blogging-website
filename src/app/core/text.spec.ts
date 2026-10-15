import { monthShort, readingMinutes, summary, toHtml, yearShort } from './text';

describe('text helpers', () => {
  it('formats stamp labels', () => {
    const d = new Date(2018, 4, 10);
    expect(monthShort(d)).toBe('MAY');
    expect(yearShort(d)).toBe('’18');
  });

  it('reads at least one minute', () => {
    expect(readingMinutes('short')).toBe(1);
    expect(readingMinutes('word '.repeat(600))).toBe(3);
  });

  it('splits plain text on line breaks and escapes markup', () => {
    expect(toHtml('One.\n\nTwo <b>.')).toBe('<p>One.</p><p>Two &lt;b&gt;.</p>');
  });

  it('groups one long block into several paragraphs', () => {
    const long = 'This is a sentence about a trip. '.repeat(30);
    expect((toHtml(long).match(/<p>/g) ?? []).length).toBeGreaterThan(2);
  });

  it('passes existing markup through for Angular to sanitise', () => {
    expect(toHtml('<p>Hi</p>')).toBe('<p>Hi</p>');
  });

  it('handles empty content', () => {
    expect(toHtml('  ')).toBe('');
  });
});

describe('summary', () => {
  it('strips markup and cuts at a word boundary', () => {
    const out = summary('<p>' + 'word '.repeat(60) + '</p>', 50);
    expect(out.endsWith('…')).toBeTrue();
    expect(out.length).toBeLessThanOrEqual(51);
    expect(out).not.toContain('<');
  });
  it('returns short text unchanged', () => {
    expect(summary('<p>Hello   there</p>')).toBe('Hello there');
  });
});
