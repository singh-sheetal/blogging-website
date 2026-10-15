import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, orderBy, query, Timestamp } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Post } from './post.model';

/** Reads every post from Firestore, newest first. (`ng build -c mock` swaps this file for sample data.) */
export async function loadPosts(): Promise<Post[]> {
  const db = getFirestore(initializeApp(environment.firebase));
  const snap = await getDocs(query(collection(db, 'blogs'), orderBy('published', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    const raw = data['published'];
    return {
      id: d.id,
      title: String(data['title'] ?? 'Untitled'),
      content: String(data['content'] ?? ''),
      quote: String(data['quote'] ?? ''),
      image: String(data['image'] ?? ''),
      author: String(data['author'] ?? 'Sheetal Singh'),
      published: raw instanceof Timestamp ? raw.toDate() : new Date(raw),
    };
  });
}
