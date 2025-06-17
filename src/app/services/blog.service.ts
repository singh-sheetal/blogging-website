import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, orderBy, limit } from '@angular/fire/firestore';
import { Observable, map, catchError, of } from 'rxjs';
import { Blog } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private firestore = inject(Firestore);

  getBlogs(): Observable<Blog[]> {
    console.log('BlogService: Getting blogs from Firestore...');
    
    try {
      const blogsRef = collection(this.firestore, 'blogs');
      const q = query(blogsRef, orderBy('published', 'desc'));
      
      return collectionData(q, { idField: 'id' }).pipe(
        map((blogs: any[]) => {
          console.log('Raw blogs from Firebase:', blogs);
          return blogs.map(blog => ({
            ...blog,
            // Convert Firestore Timestamp to Date if needed
            published: blog.published?.toDate ? blog.published.toDate() : new Date(blog.published)
          })) as Blog[];
        }),
        catchError(error => {
          console.error('Error fetching blogs from Firebase:', error);
          console.log('Falling back to mock data...');
          return of(this.getFallbackBlogs());
        })
      );
    } catch (error) {
      console.error('Error setting up Firestore:', error);
      return of(this.getFallbackBlogs());
    }
  }

  getBlogById(id: string): Observable<Blog> {
    console.log('BlogService: Getting blog with ID from Firestore:', id);
    
    try {
      const blogDocRef = doc(this.firestore, `blogs/${id}`);
      
      return docData(blogDocRef, { idField: 'id' }).pipe(
        map((blog: any) => {
          if (!blog) {
            throw new Error(`Blog with id ${id} not found`);
          }
          
          console.log('Raw blog from Firebase:', blog);
          
          return {
            ...blog,
            // Convert Firestore Timestamp to Date if needed
            published: blog.published?.toDate ? blog.published.toDate() : new Date(blog.published)
          } as Blog;
        }),
        catchError(error => {
          console.error('Error fetching blog from Firebase:', error);
          console.log('Falling back to mock data...');
          const fallbackBlog = this.getFallbackBlogs().find(b => b.id === id);
          if (fallbackBlog) {
            return of(fallbackBlog);
          }
          throw error;
        })
      );
    } catch (error) {
      console.error('Error setting up Firestore doc:', error);
      const fallbackBlog = this.getFallbackBlogs().find(b => b.id === id);
      if (fallbackBlog) {
        return of(fallbackBlog);
      }
      throw error;
    }
  }

  // New method to get profile photo from Firebase
  getProfilePhoto(): Observable<string | null> {
    console.log('BlogService: Getting profile photo from Firestore...');
    
    try {
      // Get the first document from profile-photo collection
      const profilePhotoRef = collection(this.firestore, 'profile-photo');
      const q = query(profilePhotoRef, limit(1));
      
      return collectionData(q, { idField: 'id' }).pipe(
        map((documents: any[]) => {
          console.log('Raw profile photo documents from Firebase:', documents);
          
          if (documents && documents.length > 0) {
            const photoDoc = documents[0];
            // Return the image field value
            return photoDoc.image || null;
          }
          
          return null;
        }),
        catchError(error => {
          console.error('Error fetching profile photo from Firebase:', error);
          // Return null instead of throwing error to show fallback
          return of(null);
        })
      );

      // Alternative approach if you know the specific document ID:
      // const profileDocRef = doc(this.firestore, 'profile-photo/XGIYSLpDvzBkGWUjn3FT');
      // 
      // return docData(profileDocRef).pipe(
      //   map(profileData => {
      //     if (profileData && profileData['image']) {
      //       return profileData['image'] as string;
      //     }
      //     return null;
      //   }),
      //   catchError(error => {
      //     console.error('Error fetching profile photo:', error);
      //     return of(null);
      //   })
      // );

    } catch (error) {
      console.error('Error in getProfilePhoto service:', error);
      return of(null);
    }
  }

  // Fallback data if Firebase fails
  private getFallbackBlogs(): Blog[] {
    return [
      {
        id: '1',
        title: 'The luxury',
        content: 'I thought sometimes doing nothing is relaxing your mind, but what "if" this non-achieveness pulls you in a blackhole of past you don\'t want to hold on to, future which you are not able to hold on to, future which is making you anxious?. Here, your passion comes heroically to fight this demonic "if". So one fine afternoon, when i had nothing important to do, i grabbed my camera and went to find a restaurant where i can get a top view of the city in night. I found some where the names of the dishes were tongue twisters and no great top view. Tired with the heavy camera around my neck, i thought of returning back when i heard a heavy engine sound. I turned and saw a luxury car just got parked at the entrance of the hotel. Rest is that my friends chuckled i did not know the brand it belonged to and i smiled at my own fight with the "if".',
        image: 'https://firebasestorage.googleapis.com/v0/b/sheetal-blog.appspot.com/o/blogs%2FDSC_0177.JPG?alt=media&token=e4dfaf73-42eb-41ea-ae4f-2204e229e266',
        published: new Date('2018-05-02T07:30:00.000Z'),
        quote: 'When you search for a need, you might end up finding a luxury, so don\'t give up',
        author: 'sheetal singh',
        authorId: 'yZYQQJFmp3fsKYSVeAF5ERT60Ag2'
      },
      {
        id: '2',
        title: 'Getting Started with Angular',
        content: '<h1>Welcome to Angular</h1><p>Angular is a powerful framework for building web applications.</p><h2>Key Features</h2><ul><li>Component-based architecture</li><li>TypeScript support</li><li>Powerful CLI</li><li>Rich ecosystem</li></ul><p>Let\'s build amazing applications together!</p>',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%233b82f6"/%3E%3Ctext x="400" y="200" text-anchor="middle" dy=".35em" fill="white" font-family="Arial" font-size="32" font-weight="bold"%3EAngular Framework%3C/text%3E%3C/svg%3E',
        published: new Date('2024-06-01'),
        quote: 'Angular makes it easy to build applications with web.',
        author: 'Angular Team',
        authorId: 'angular-team'
      }
    ];
  }
}