export interface Post {
  id: string;
  title: string;
  /** Raw content from Firestore (plain text or simple HTML). */
  content: string;
  quote: string;
  published: Date;
  author: string;
}
