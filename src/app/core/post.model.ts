export interface Post {
  id: string;
  /** Readable URL name made from the title, e.g. "a-day-with-apple". */
  slug: string;
  title: string;
  /** Raw content from Firestore (plain text or simple HTML). */
  content: string;
  quote: string;
  /** Cover photo URL, or an empty string when the post has none. */
  image: string;
  published: Date;
  author: string;
}
