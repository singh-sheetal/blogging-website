import { inject, Injectable, makeStateKey, PendingTasks, TransferState } from '@angular/core';
import { Post } from './post.model';
import { loadPosts } from './posts-source';

/** Posts handed from the build-time render to the browser, so the page doesn't flash empty and refetch. */
const POSTS = makeStateKey<(Omit<Post, 'published'> & { published: string })[]>('posts');

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly transfer = inject(TransferState);
  private readonly pending = inject(PendingTasks);
  private cache: Promise<Post[]> | null = null;
  private ready: Post[] | null = this.fromTransfer();

  /** Posts already available synchronously (prerendered page being hydrated), or null. */
  snapshot(): Post[] | null {
    return this.ready;
  }

  /** All posts, newest first. Fetched once and reused. */
  getPosts(): Promise<Post[]> {
    this.cache ??= (this.ready ? Promise.resolve(this.ready) : this.fetch()).catch((err) => {
      this.cache = null; // allow a retry after a failure
      throw err;
    });
    return this.cache;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return (await this.getPosts()).find((p) => p.id === id);
  }

  private async fetch(): Promise<Post[]> {
    // PendingTasks makes the build-time render wait until the posts have arrived.
    const done = this.pending.add();
    let posts: Post[];
    try {
      posts = await loadPosts();
    } finally {
      done();
    }
    this.ready = posts;
    this.transfer.set(
      POSTS,
      posts.map((p) => ({ ...p, published: p.published.toISOString() })),
    );
    return posts;
  }

  private fromTransfer(): Post[] | null {
    const raw = this.transfer.get(POSTS, null);
    return raw ? raw.map((p) => ({ ...p, published: new Date(p.published) })) : null;
  }
}
