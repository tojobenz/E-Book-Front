import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of, catchError } from 'rxjs';

import { FavoriteApiService } from '../../../../core/services/favorite-api.service';
import { BookApiService } from '../../../../core/services/book-api.service';
import { Favorite } from '../../../../core/models/favorite.model';
import { Book } from '../../../../core/models/book.model';

import { BookCardComponent } from '../../../../shared/components/book-card/book-card.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

interface DisplayBook {
  id?: number;
  isbn?: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  isAvailable?: boolean;
  availability?: string;
  isExternal: boolean;
}

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    BookCardComponent,
    LoadingComponent,
    EmptyStateComponent,
    ErrorMessageComponent
  ],
  templateUrl: './favorites-page.component.html',
  styleUrls: ['./favorites-page.component.scss']
})
export class FavoritesPageComponent implements OnInit {
  private router = inject(Router);
  private favoriteApiService = inject(FavoriteApiService);
  private bookApiService = inject(BookApiService);

  readonly displayBooks = signal<DisplayBook[]>([]);
  readonly favorites = signal<Favorite[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading.set(true);
    this.error.set(null);

    this.favoriteApiService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.loadDisplayBooks(favorites);
      },
      error: () => {
        this.error.set('Failed to load favorites');
        this.loading.set(false);
      }
    });
  }

  loadDisplayBooks(favorites: Favorite[]): void {
    if (favorites.length === 0) {
      this.displayBooks.set([]);
      this.loading.set(false);
      return;
    }

    const bookObservables = favorites.map(f => {
      if (f.bookId) {
        return this.bookApiService.getBook(f.bookId).pipe(
          catchError(() => of(null as Book | null))
        );
      } else {
        return of(null as Book | null);
      }
    });

    forkJoin(bookObservables).subscribe({
      next: (books) => {
        const displayBooks: DisplayBook[] = favorites.map((favorite, index) => {
          const book = books[index];
          if (book) {
            return {
              id: book.id,
              title: book.title,
              author: book.author,
              description: book.description,
              coverUrl: book.coverUrl,
              publishedDate: book.publishedDate,
              isExternal: false
            } as DisplayBook;
          } else if (favorite.isbn) {
            return {
              isbn: favorite.isbn,
              title: favorite.title || 'Unknown Title',
              author: favorite.author || 'Unknown Author',
              description: favorite.description,
              coverUrl: favorite.coverUrl,
              publishedDate: favorite.publishedDate,
              isAvailable: favorite.isAvailable,
              availability: favorite.availability,
              isExternal: true
            } as DisplayBook;
          }
          return null;
        }).filter((book): book is DisplayBook => book !== null);

        this.displayBooks.set(displayBooks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load favorites');
        this.loading.set(false);
      }
    });
  }

  onFavoriteToggle(book: DisplayBook): void {
    if (book.isExternal && book.isbn) {
      this.favoriteApiService.removeExternalFavorite(book.isbn).subscribe({
        next: () => {
          this.favorites.update(list => list.filter(f => f.isbn !== book.isbn));
          this.displayBooks.update(list => list.filter(b => b.isbn !== book.isbn));
        },
        error: (err) => {
          console.error('Failed to remove favorite', err);
        }
      });
    } else if (book.id) {
      this.favoriteApiService.removeLocalFavorite(book.id).subscribe({
        next: () => {
          this.favorites.update(list => list.filter(f => f.bookId !== book.id));
          this.displayBooks.update(list => list.filter(b => b.id !== book.id));
        },
        error: (err) => {
          console.error('Failed to remove favorite', err);
        }
      });
    }
  }

  onCardClick(book: DisplayBook): void {
    if (book.id) {
      this.router.navigate(['/books', book.id]);
    }
  }

  trackByBookId(_index: number, book: DisplayBook): string {
    return book.isExternal ? (book.isbn || '') : (book.id?.toString() || '');
  }

  retryLoad(): void {
    this.loadFavorites();
  }
}
