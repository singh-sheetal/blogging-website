import { slugify, withSlugs } from './slug';

describe('slugify', () => {
  it('makes readable lowercase slugs', () => {
    expect(slugify('Mummy, Can I go to Europe?')).toBe('mummy-can-i-go-to-europe');
    expect(slugify('Café déjà vu — Paris!')).toBe('cafe-deja-vu-paris');
    expect(slugify("It's a girl's trip")).toBe('its-a-girls-trip');
  });
  it('returns empty for titles with no letters or digits', () => {
    expect(slugify('???')).toBe('');
  });
  it('caps the length without leaving a trailing hyphen', () => {
    const s = slugify('word '.repeat(40));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith('-')).toBeFalse();
  });
});

describe('withSlugs', () => {
  const post = (id: string, title: string) => ({ id, title, content: '', quote: '', image: '', author: '', published: new Date() });
  it('keeps slugs unique and falls back to the id', () => {
    const out = withSlugs([post('a', 'Hello'), post('b', 'Hello'), post('c', '???')]);
    expect(out.map((p) => p.slug)).toEqual(['hello', 'hello-2', 'c']);
  });
});
