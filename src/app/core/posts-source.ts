import { getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, orderBy, query, Timestamp } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Post } from './post.model';

let shared: Promise<Post[]> | null = null;

/**
 * Reads every post from Firestore, newest first. (`ng build -c mock` swaps this file for sample data.)
 * The request is made once per process and reused, so a build that renders every story does not
 * ask Firestore again for each page; one failed attempt is retried before giving up.
 */
export function loadPosts(): Promise<Post[]> {
  shared ??= fetchWithRetry().catch((err) => {
    shared = null; // allow a later retry
    throw err;
  });
  return shared;
}

async function fetchWithRetry(): Promise<Post[]> {
  try {
    return await fetchPosts();
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return fetchPosts();
  }
}

async function fetchPosts(): Promise<Post[]> {
  const db = getFirestore(getApps()[0] ?? initializeApp(environment.firebase));
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
