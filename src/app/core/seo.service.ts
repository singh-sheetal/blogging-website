import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from './site.config';

export interface PageSeo {
  title: string;
  description: string;
  /** Path starting with "/", e.g. "/blog/abc". */
  path: string;
  image?: string;
  article?: { headline: string; published: Date; author: string };
}

/** Sets the title, description, canonical link, share-card tags and structured data for the current page. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  set(page: PageSeo): void {
    const url = SITE.url + (page.path === '/' ? '/' : page.path);
    this.title.setTitle(page.title);

    const tags: Record<string, string> = {
      'name:description': page.description,
      'property:og:title': page.title,
      'property:og:description': page.description,
      'property:og:url': url,
      'property:og:type': page.article ? 'article' : 'website',
      'name:twitter:card': page.image ? 'summary_large_image' : 'summary',
      'name:twitter:title': page.title,
      'name:twitter:description': page.description,
    };
    for (const [key, content] of Object.entries(tags)) {
      const [attr, name] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
      this.meta.updateTag({ [attr]: name, content });
    }
    this.optional('property', 'og:image', page.image);
    this.optional('name', 'twitter:image', page.image);
    this.optional('property', 'article:published_time', page.article?.published.toISOString());

    this.canonical(url);
    this.jsonLd(page, url);
  }

  private optional(attr: 'name' | 'property', name: string, content?: string): void {
    if (content) this.meta.updateTag({ [attr]: name, content });
    else this.meta.removeTag(`${attr}='${name}'`);
  }

  private canonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }

  private jsonLd(page: PageSeo, url: string): void {
    const id = 'ld-json';
    this.doc.getElementById(id)?.remove();
    const data = page.article
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: page.article.headline,
          description: page.description,
          datePublished: page.article.published.toISOString(),
          author: { '@type': 'Person', name: page.article.author },
          mainEntityOfPage: url,
          ...(page.image ? { image: page.image } : {}),
        }
      : { '@context': 'https://schema.org', '@type': 'Blog', name: `${SITE.name} · ${SITE.tagline}`, url, description: page.description };
    const script = this.doc.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    // "<" is escaped so post text can never close the script tag.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.doc.head.appendChild(script);
  }
}
