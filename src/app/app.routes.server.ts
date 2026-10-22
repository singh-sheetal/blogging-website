import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { PostService } from './core/post.service';

/**
 * Every page is rendered to plain HTML at build time, so search engines and
 * link previews (WhatsApp, LinkedIn, …) see the real story without running JS.
 * If Firestore can't be reached the build fails rather than shipping empty pages.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'blog/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => (await inject(PostService).getPosts()).map((p) => ({ id: p.id })),
  },
  { path: '**', renderMode: RenderMode.Client },
];
