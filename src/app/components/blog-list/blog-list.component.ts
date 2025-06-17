import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Profile photo properties
  profilePhotoUrl: string | null = null;
  profilePhotoLoading: boolean = true;
  fallbackProfilePhoto: string = this.getProfilePlaceholderImage();
  
  private subscription: Subscription = new Subscription();
  private blogService = inject(BlogService);

  ngOnInit(): void {
    this.loadProfilePhoto();
    this.loadBlogs();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProfilePhoto(): void {
    this.profilePhotoLoading = true;
    
    const photoSub = this.blogService.getProfilePhoto().subscribe({
      next: (photoUrl: string | null) => {
        this.profilePhotoUrl = photoUrl;
        this.profilePhotoLoading = false;
        console.log('Profile photo loaded:', photoUrl);
      },
      error: (error) => {
        console.error('Error loading profile photo:', error);
        this.profilePhotoUrl = null; // Will use fallback
        this.profilePhotoLoading = false;
      }
    });

    this.subscription.add(photoSub);
  }

  loadBlogs(): void {
    this.loading = true;
    this.error = null;
    
    const blogsSub = this.blogService.getBlogs().subscribe({
      next: (blogs: Blog[]) => {
        this.blogs = blogs;
        this.loading = false;
        console.log('Blogs loaded:', blogs);
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.error = 'Failed to load blogs. Please try again later.';
        this.loading = false;
      }
    });

    this.subscription.add(blogsSub);
  }

  trackByBlogId(index: number, blog: Blog): string {
    return blog.id || index.toString();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    const originalSrc = target.src;
    console.log('❌ Image failed to load:', originalSrc);
    
    // Try different strategies for Firebase Storage URLs
    if (originalSrc.includes('firebasestorage.googleapis.com')) {
      // Remove any existing alt parameters and add token if needed
      let newSrc = originalSrc.split('?')[0];
      
      // Add alt=media parameter for direct access
      if (!originalSrc.includes('alt=media')) {
        newSrc += '?alt=media';
      }
      
      // If this is not the first retry, use the original URL with different parameters
      if (!originalSrc.includes('&retry=1')) {
        target.src = newSrc + '&retry=1';
        console.log('🔄 Retrying Firebase Storage image with alt=media:', target.src);
        return;
      }
    }
    
    // Final fallback to placeholder
    console.log('🔄 Using placeholder image');
    target.src = this.getPlaceholderImage();
  }

  onImageLoad(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.log('✅ Image loaded successfully:', target.src);
  }

  onProfileImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    const originalSrc = target.src;
    console.log('❌ Profile image failed to load:', originalSrc);
    
    // Try different strategies for Firebase Storage URLs
    if (originalSrc.includes('firebasestorage.googleapis.com')) {
      let newSrc = originalSrc.split('?')[0];
      
      if (!originalSrc.includes('alt=media')) {
        newSrc += '?alt=media';
      }
      
      if (!originalSrc.includes('&retry=1')) {
        target.src = newSrc + '&retry=1';
        console.log('🔄 Retrying Profile Firebase Storage image with alt=media:', target.src);
        return;
      }
    }
    
    // Final fallback to profile placeholder
    console.log('🔄 Using profile placeholder image');
    target.src = this.fallbackProfilePhoto;
  }

  onProfileImageLoad(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.log('✅ Profile image loaded successfully:', target.src);
  }

  getFormattedDate(published: any): string {
    try {
      if (!published) {
        return 'Date not available';
      }

      // Check if it's a Firestore Timestamp
      if (published && typeof published.toDate === 'function') {
        return published.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } 
      
      // Check if it's already a Date object
      if (published instanceof Date) {
        return published.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } 
      
      // Check if it's a string that can be converted to Date
      if (typeof published === 'string') {
        const date = new Date(published);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      }

      // Check if it's a Firestore Timestamp-like object with seconds
      if (published && typeof published.seconds === 'number') {
        return new Date(published.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      return 'Date not available';
    } catch (error) {
      console.error('Error formatting date:', error, 'Published value:', published);
      return 'Date not available';
    }
  }

  private getPlaceholderImage(): string {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="250" fill="url(%23grad1)"/%3E%3Cpath d="M50 180 Q100 140 150 160 Q200 120 250 140 Q300 100 350 120 L400 140 L400 250 L0 250 Z" fill="rgba(255,255,255,0.1)"/%3E%3Cpath d="M0 200 Q50 180 100 190 Q150 170 200 180 Q250 160 300 170 Q350 150 400 160 L400 250 L0 250 Z" fill="rgba(255,255,255,0.15)"/%3E%3Ccircle cx="80" cy="80" r="25" fill="rgba(255,255,255,0.3)"/%3E%3Cpath d="M320 60 L340 60 L330 40 Z" fill="rgba(255,255,255,0.4)"/%3E%3Cpath d="M300 70 L320 70 L310 50 Z" fill="rgba(255,255,255,0.3)"/%3E%3Cpath d="M340 80 L360 80 L350 60 Z" fill="rgba(255,255,255,0.35)"/%3E%3Cg transform="translate(170,100)"%3E%3Crect x="-15" y="-10" width="30" height="20" rx="3" fill="rgba(255,255,255,0.4)"/%3E%3Ccircle cx="0" cy="0" r="8" fill="rgba(255,255,255,0.6)"/%3E%3Ccircle cx="0" cy="0" r="5" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="-20" y="-8" width="8" height="4" rx="1" fill="rgba(255,255,255,0.4)"/%3E%3C/g%3E%3Ctext x="200" y="200" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="14" font-weight="300"%3ETravel Story%3C/text%3E%3C/svg%3E';
  }

  private getProfilePlaceholderImage(): string {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Cdefs%3E%3ClinearGradient id="profileGrad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx="100" cy="100" r="100" fill="url(%23profileGrad)"/%3E%3Ccircle cx="100" cy="80" r="30" fill="rgba(255,255,255,0.3)"/%3E%3Cpath d="M100 120 Q70 140 70 160 Q70 170 100 170 Q130 170 130 160 Q130 140 100 120" fill="rgba(255,255,255,0.3)"/%3E%3Cg transform="translate(100,130)"%3E%3Crect x="-8" y="-5" width="16" height="10" rx="2" fill="rgba(255,255,255,0.4)"/%3E%3Ccircle cx="0" cy="0" r="4" fill="rgba(255,255,255,0.6)"/%3E%3Ccircle cx="0" cy="0" r="2" fill="rgba(255,255,255,0.3)"/%3E%3C/g%3E%3C/svg%3E';
  }
}