import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Sheetal Singh · Travel Stories', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'blog/:id', loadComponent: () => import('./pages/story/story.component').then((m) => m.StoryComponent) },
  { path: '**', redirectTo: '' },
];
