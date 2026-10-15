import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../core/post.model';
import { PostService } from '../../core/post.service';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../core/site.config';
import { monthShort, monthYear, yearShort } from '../../core/text';
import { BrokenImages } from '../../core/broken-images';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SiteHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly seo = inject(SeoService);

  protected readonly images = inject(BrokenImages);
  protected readonly site = SITE;
  protected readonly posts = signal<Post[]>(this.postService.snapshot() ?? []);
  protected readonly loading = signal(this.postService.snapshot() === null);
  protected readonly error = signal(false);
  protected readonly latest = computed(() => this.posts()[0]);
  protected readonly years = computed(() => {
    const groups = new Map<number, Post[]>();
    for (const p of this.posts()) {
      const y = p.published.getFullYear();
      groups.set(y, [...(groups.get(y) ?? []), p]);
    }
    return [...groups].map(([year, posts]) => ({ year, posts }));
  });

  protected readonly monthShort = monthShort;
  protected readonly yearShort = yearShort;
  protected readonly monthYear = monthYear;

  ngOnInit(): void {
    this.seo.set({ title: `${SITE.name} · ${SITE.tagline}`, description: SITE.description, path: '/' });
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(this.postService.snapshot() === null);
    this.error.set(false);
    try {
      this.posts.set(await this.postService.getPosts());
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
