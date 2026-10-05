import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page/home-page.component')
      .then(m => m.HomePageComponent),
    title: 'Home - EBook'
  },
  {
    path: 'books',
    loadComponent: () => import('./features/books/pages/books-page/books-page.component')
      .then(m => m.BooksPageComponent),
    title: 'Books - EBook'
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./features/books/pages/book-details-page/book-details-page.component')
      .then(m => m.BookDetailsPageComponent),
    title: 'Book Details - EBook'
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/pages/favorites-page/favorites-page.component')
      .then(m => m.FavoritesPageComponent),
    title: 'Favorites - EBook'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
