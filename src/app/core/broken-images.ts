import { Injectable, signal } from '@angular/core';

/** Remembers which image URLs failed to load, so the page can hide them instead of showing a broken icon. */
@Injectable({ providedIn: 'root' })
export class BrokenImages {
  private readonly failed = signal<ReadonlySet<string>>(new Set());

  isBroken(url: string): boolean {
    return this.failed().has(url);
  }

  mark(url: string): void {
    this.failed.update((s) => new Set(s).add(url));
  }
}
