import { Post } from './post.model';
import { withSlugs } from './slug';

/** Offline sample data for `ng build -c mock`, so the site can be built and previewed without Firestore. */
export async function loadPosts(): Promise<Post[]> {
  const body = (n: number) =>
    Array.from({ length: n }, (_, i) => `Paragraph ${i + 1}: the detours, the small embarrassments and the odd lessons.`).join('\n\n');
  return withSlugs([
    { id: 'cologne', title: 'Mummy, Can I Go to Europe?', content: body(4), quote: 'A first trip, and a very tall cathedral.', image: '', published: new Date('2024-06-12'), author: 'Sheetal Singh' },
    { id: 'lost-bus', title: 'The Bus That Was Not Mine', content: body(3), quote: '', image: '', published: new Date('2023-03-02'), author: 'Sheetal Singh' },
  ]);
}
