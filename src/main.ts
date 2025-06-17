import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Your Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyDBwU3ZVHrIX2nDiGOE0E3kkbTsoziiRMg",
  authDomain: "sheetal-blog.firebaseapp.com",
  projectId: "sheetal-blog",
  storageBucket: "sheetal-blog.appspot.com",
  messagingSenderId: "481778548275",
  appId: "1:481778548275:web:c27ad88b1191e3dd002d46",
  measurementId: "G-SSJ3YVFYK0"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // Firebase providers
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ]
}).catch(err => console.error('Bootstrap Error:', err));