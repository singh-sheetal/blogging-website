import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, orderBy, query, Timestamp } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly db = getFirestore(initializeApp(environment.firebase));
  private cache: Promise<Post[]> | null = null;

  /** All posts, newest first. Fetched once and reused. */
  getPosts(): Promise<Post[]> {
    this.cache ??= this.fetch().catch((err) => {
      this.cache = null; // allow a retry after a failure
      throw err;
    });
    return this.cache;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return (await this.getPosts()).find((p) => p.id === id);
  }

  private async fetch(): Promise<Post[]> {
    const snap = await getDocs(query(collection(this.db, 'blogs'), orderBy('published', 'desc')));
    return snap.docs.map((d) => {
      const data = d.data();
      const raw = data['published'];
      return {
        id: d.id,
        title: String(data['title'] ?? 'Untitled'),
        content: String(data['content'] ?? ''),
        quote: String(data['quote'] ?? ''),
        author: String(data['author'] ?? 'Sheetal Singh'),
        published: raw instanceof Timestamp ? raw.toDate() : new Date(raw),
      };
    });
  }
}
