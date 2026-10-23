import { ChangeDetectionStrategy, Component, computed, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Post } from '../../core/post.model';
import { PostService } from '../../core/post.service';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../core/site.config';
import { monthYear, monthYearShort, readingMinutes, summary, toHtml } from '../../core/text';
import { BrokenImages } from '../../core/broken-images';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';

@Component({
  selector: 'app-story',
  imports: [RouterLink, SiteHeaderComponent],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryComponent {
  private readonly postService = inject(PostService);
  protected readonly images = inject(BrokenImages);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Bound from the route (:key) via withComponentInputBinding: a slug, or an old-style post id. */
  readonly key = input.required<string>();

  protected readonly all = signal<Post[]>(this.postService.snapshot() ?? []);
  protected readonly state = signal<'loading' | 'ready' | 'missing' | 'error'>(this.postService.snapshot() ? 'ready' : 'loading');

  protected readonly index = computed(() => this.all().findIndex((p) => p.slug === this.key() || p.id === this.key()));
  protected readonly post = computed(() => this.all()[this.index()]);
  /** Posts are newest first, so the next index is the older story. */
  protected readonly older = computed(() => this.all()[this.index() + 1]);
  protected readonly newer = computed(() => (this.index() > 0 ? this.all()[this.index() - 1] : undefined));
  protected readonly html = computed(() => toHtml(this.post()?.content ?? ''));
  protected readonly minutes = computed(() => readingMinutes(this.post()?.content ?? ''));

  protected readonly monthYear = monthYear;
  protected readonly monthYearShort = monthYearShort;

  constructor() {
    void this.load();
    effect(() => {
      const p = this.post();
      if (!p) return;
      this.seo.set({
        title: `${p.title} · ${SITE.name}`,
        description: p.quote || summary(p.content) || SITE.description,
        path: `/blog/${p.slug}`,
        image: p.image || undefined,
        article: { headline: p.title, published: p.published, author: p.author },
      });
      // An old link with the post id: show the same story at its readable address.
      if (this.isBrowser && this.key() !== p.slug) {
        void this.router.navigate(['/blog', p.slug], { replaceUrl: true });
      }
    });
  }

  protected async load(): Promise<void> {
    if (!this.postService.snapshot()) this.state.set('loading');
    try {
      this.all.set(await this.postService.getPosts());
      this.state.set(this.index() === -1 ? 'missing' : 'ready');
    } catch {
      this.state.set('error');
    }
  }

  /** Re-evaluates "missing" when navigating between stories without reloading. */
  protected readonly view = computed(() => {
    const s = this.state();
    if (s === 'ready' || s === 'missing') return this.index() === -1 ? 'missing' : 'ready';
    return s;
  });
}
