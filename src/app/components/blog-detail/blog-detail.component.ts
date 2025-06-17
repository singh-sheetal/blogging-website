import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  blog: Blog | null = null;
  loading: boolean = true;
  error: string | null = null;
  blogId: string | null = null;
  private subscription: Subscription = new Subscription();
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);

  ngOnInit(): void {
    // Get the blog ID from the route parameters
    const routeSub = this.route.paramMap.subscribe(params => {
      this.blogId = params.get('id');
      if (this.blogId) {
        this.loadBlog(this.blogId);
      } else {
        this.error = 'No blog ID provided';
        this.loading = false;
      }
    });

    this.subscription.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadBlog(id: string): void {
    this.loading = true;
    this.error = null;

    const blogSub = this.blogService.getBlogById(id).subscribe({
      next: (blog: Blog) => {
        if (blog) {
          this.blog = blog;
          this.loading = false;
          console.log('Blog loaded:', blog);
        } else {
          this.error = 'Story not found';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.error = 'Failed to load story. Please try again later.';
        this.loading = false;
      }
    });

    this.subscription.add(blogSub);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  retry(): void {
    if (this.blogId) {
      this.loadBlog(this.blogId);
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    const originalSrc = target.src;
    console.log('❌ Blog detail image failed to load:', originalSrc);
    
    // Try different strategies for Firebase Storage URLs
    if (originalSrc.includes('firebasestorage.googleapis.com')) {
      let newSrc = originalSrc.split('?')[0];
      
      if (!originalSrc.includes('alt=media')) {
        newSrc += '?alt=media';
      }
      
      if (!originalSrc.includes('&retry=1')) {
        target.src = newSrc + '&retry=1';
        console.log('🔄 Retrying Firebase Storage image in detail view:', target.src);
        return;
      }
    }
    
    // Final fallback to placeholder
    console.log('🔄 Using placeholder image for detail view');
    target.src = this.getPlaceholderImage();
  }

  onImageLoad(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.log('✅ Blog detail image loaded successfully:', target.src);
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
          month: 'long',
          day: 'numeric'
        });
      } 
      
      // Check if it's already a Date object
      if (published instanceof Date) {
        return published.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } 
      
      // Check if it's a string that can be converted to Date
      if (typeof published === 'string') {
        const date = new Date(published);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }

      // Check if it's a Firestore Timestamp-like object with seconds
      if (published && typeof published.seconds === 'number') {
        return new Date(published.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
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
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Cdefs%3E%3ClinearGradient id="detailGrad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23detailGrad)"/%3E%3Cpath d="M100 320 Q200 280 300 300 Q400 240 500 260 Q600 200 700 220 L800 240 L800 400 L0 400 Z" fill="rgba(255,255,255,0.1)"/%3E%3Cpath d="M0 360 Q100 340 200 350 Q300 330 400 340 Q500 320 600 330 Q700 310 800 320 L800 400 L0 400 Z" fill="rgba(255,255,255,0.15)"/%3E%3Ccircle cx="160" cy="120" r="40" fill="rgba(255,255,255,0.3)"/%3E%3Cpath d="M600 100 L640 100 L620 60 Z" fill="rgba(255,255,255,0.4)"/%3E%3Cpath d="M560 120 L600 120 L580 80 Z" fill="rgba(255,255,255,0.3)"/%3E%3Cpath d="M640 140 L680 140 L660 100 Z" fill="rgba(255,255,255,0.35)"/%3E%3Cg transform="translate(400,200)"%3E%3Crect x="-25" y="-15" width="50" height="30" rx="5" fill="rgba(255,255,255,0.4)"/%3E%3Ccircle cx="0" cy="0" r="12" fill="rgba(255,255,255,0.6)"/%3E%3Ccircle cx="0" cy="0" r="8" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="-30" y="-12" width="12" height="6" rx="2" fill="rgba(255,255,255,0.4)"/%3E%3C/g%3E%3Ctext x="400" y="350" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="18" font-weight="300"%3ETravel Story%3C/text%3E%3C/svg%3E';
  }
}