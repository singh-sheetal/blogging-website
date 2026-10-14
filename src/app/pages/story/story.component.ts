import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Post } from '../../core/post.model';
import { PostService } from '../../core/post.service';
import { SITE } from '../../core/site.config';
import { monthYear, monthYearShort, readingMinutes, toHtml } from '../../core/text';
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
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  /** Bound from the route (:id) via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly all = signal<Post[]>([]);
  protected readonly state = signal<'loading' | 'ready' | 'missing' | 'error'>('loading');

  protected readonly index = computed(() => this.all().findIndex((p) => p.id === this.id()));
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
      const desc = p.quote || SITE.description;
      this.title.setTitle(`${p.title} · ${SITE.name}`);
      this.meta.updateTag({ name: 'description', content: desc });
      this.meta.updateTag({ property: 'og:title', content: p.title });
      this.meta.updateTag({ property: 'og:description', content: desc });
      this.meta.updateTag({ property: 'og:type', content: 'article' });
      if (p.image) this.meta.updateTag({ property: 'og:image', content: p.image });
      else this.meta.removeTag("property='og:image'");
    });
  }

  protected async load(): Promise<void> {
    this.state.set('loading');
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
