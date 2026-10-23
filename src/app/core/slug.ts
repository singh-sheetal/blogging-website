import { Post } from './post.model';

/** "A day with apple!" → "a-day-with-apple". Accents are dropped, anything else becomes a hyphen. */
export function slugify(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/** Gives every post a unique, readable slug (a second post with the same title gets "-2"). Posts without a usable title keep their id. */
export function withSlugs<T extends Omit<Post, 'slug'>>(posts: T[]): (T & { slug: string })[] {
  const used = new Set<string>();
  return posts.map((p) => {
    const base = slugify(p.title) || p.id;
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    return { ...p, slug };
  });
}
