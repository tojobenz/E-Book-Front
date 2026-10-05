import {
  Component,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
  signal,
  effect,
  ElementRef,
  viewChild,
  Injector,
  afterNextRender
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FavoriteApiService } from '../../../../core/services/favorite-api.service';
import { ExternalBookApiService } from '../../../../core/services/external-book-api.service';
import { ExternalBook } from '../../../../core/models/external-book.model';

import { BookCardComponent } from '../../../../shared/components/book-card/book-card.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

const PAGE_SIZE = 10;

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
  selector: 'app-books-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    BookCardComponent,
    SearchBarComponent,
    LoadingComponent,
    EmptyStateComponent,
    ErrorMessageComponent
  ],
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.scss']
})
export class BooksPageComponent {
  private favoriteApiService = inject(FavoriteApiService);
  private externalBookApiService = inject(ExternalBookApiService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  private readonly loadMoreSentinel = viewChild<ElementRef<HTMLElement>>('loadMoreSentinel');

  readonly displayBooks = signal<DisplayBook[]>([]);
  readonly favoriteBookIds = signal<Set<number>>(new Set());
  readonly favoriteIsbns = signal<Set<string>>(new Set());
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly hasMore = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchMode = signal<'new' | 'search'>('new');

  private searchSubject = new Subject<string>();
  private currentQuery = '';
  /** Open Library offset for the next page (accounts for over-fetch on API). */
  private nextOffset = 0;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
    this.loadNewReleases();
    this.loadFavorites();
    this.setupSearch();

    // Bind observer when the sentinel enters the DOM (after first paint / @if)
    afterNextRender(() => {
      effect(() => {
        const sentinelRef = this.loadMoreSentinel();
        this.bindInfiniteScroll(sentinelRef?.nativeElement ?? null);
      }, { injector: this.injector });
    });

    this.destroyRef.onDestroy(() => {
      this.intersectionObserver?.disconnect();
    });
  }

  private bindInfiniteScroll(sentinel: HTMLElement | null): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;

    if (!sentinel) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          this.loadMore();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    this.intersectionObserver.observe(sentinel);
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        this.loading.set(true);
        this.error.set(null);
        this.hasMore.set(true);
        this.nextOffset = 0;
        this.currentQuery = searchTerm?.trim() ?? '';

        if (this.currentQuery.length > 0) {
          this.searchMode.set('search');
          return this.externalBookApiService.searchBooks(this.currentQuery, PAGE_SIZE, 0).pipe(
            tap(books => {
              if (books.length > 0) {
                this.advanceOffset();
              }
            }),
            catchError(() => {
              this.error.set('Failed to search books');
              this.loading.set(false);
              this.hasMore.set(false);
              return of([]);
            })
          );
        }

        this.searchMode.set('new');
        return this.externalBookApiService.getNewReleases(PAGE_SIZE, 0).pipe(
          tap(books => {
            if (books.length > 0) {
              this.advanceOffset();
            }
          }),
          catchError(() => {
            this.error.set('Failed to load new releases');
            this.loading.set(false);
            this.hasMore.set(false);
            return of([]);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(books => {
      this.setExternalBooks(books, false);
      this.loading.set(false);
    });
  }

  /** Advance Open Library offset by the over-fetch window used server-side. */
  private advanceOffset(): void {
    const step = this.searchMode() === 'new' ? PAGE_SIZE * 3 : PAGE_SIZE + 15;
    this.nextOffset += step;
  }

  private toDisplayBooks(books: ExternalBook[]): DisplayBook[] {
    return books.map(book => ({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      description: book.description,
      coverUrl: book.coverUrl,
      publishedDate: book.publishedDate,
      isAvailable: book.isAvailable,
      availability: book.availability,
      isExternal: true
    }));
  }

  private setExternalBooks(books: ExternalBook[], append: boolean): void {
    const mapped = this.toDisplayBooks(books);

    if (!append) {
      this.displayBooks.set(mapped);
      this.hasMore.set(mapped.length >= PAGE_SIZE);
      return;
    }

    const existing = new Set(
      this.displayBooks().map(b => b.isbn).filter((isbn): isbn is string => !!isbn)
    );
    const unique = mapped.filter(b => b.isbn && !existing.has(b.isbn));
    this.displayBooks.update(list => [...list, ...unique]);
    this.hasMore.set(mapped.length >= PAGE_SIZE);
  }

  loadNewReleases(): void {
    this.loading.set(true);
    this.error.set(null);
    this.searchMode.set('new');
    this.currentQuery = '';
    this.nextOffset = 0;
    this.hasMore.set(true);

    this.externalBookApiService.getNewReleases(PAGE_SIZE, 0).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (books) => {
        if (books.length > 0) {
          this.advanceOffset();
        }
        this.setExternalBooks(books, false);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load new releases:', err);
        this.error.set('Failed to load new releases');
        this.loading.set(false);
        this.hasMore.set(false);
      }
    });
  }

  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore() || this.error()) {
      return;
    }

    this.loadingMore.set(true);
    const offset = this.nextOffset;
    const request$ = this.searchMode() === 'search' && this.currentQuery
      ? this.externalBookApiService.searchBooks(this.currentQuery, PAGE_SIZE, offset)
      : this.externalBookApiService.getNewReleases(PAGE_SIZE, offset);

    request$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (books) => {
        if (books.length > 0) {
          this.advanceOffset();
        }
        this.setExternalBooks(books, true);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error('Failed to load more books:', err);
        this.loadingMore.set(false);
        this.hasMore.set(false);
      }
    });
  }

  loadFavorites(): void {
    this.favoriteApiService.getFavorites().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (favorites) => {
        const bookIds = favorites.filter(f => f.bookId).map(f => f.bookId!);
        const isbns = favorites.filter(f => f.isbn).map(f => f.isbn!);
        this.favoriteBookIds.set(new Set(bookIds));
        this.favoriteIsbns.set(new Set(isbns));
      },
      error: (err) => {
        console.error('Failed to load favorites', err);
      }
    });
  }

  onSearch(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onFavoriteToggle(book: DisplayBook): void {
    if (book.isExternal) {
      if (!book.isbn) {
        this.error.set('Cannot favorite this book: missing ISBN');
        return;
      }

      if (this.favoriteIsbns().has(book.isbn)) {
        this.favoriteApiService.removeExternalFavorite(book.isbn).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: () => {
            this.favoriteIsbns.update(ids => {
              const next = new Set(ids);
              next.delete(book.isbn!);
              return next;
            });
          },
          error: (err: unknown) => {
            console.error('Failed to remove favorite', err);
            this.error.set('Failed to remove favorite');
          }
        });
      } else {
        const externalBook: ExternalBook = {
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          description: book.description,
          coverUrl: book.coverUrl,
          publishedDate: book.publishedDate,
          isAvailable: book.isAvailable,
          availability: book.availability
        };

        this.favoriteApiService.addExternalFavorite(externalBook).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: () => {
            this.favoriteIsbns.update(ids => {
              const next = new Set(ids);
              next.add(book.isbn!);
              return next;
            });
          },
          error: (err: unknown) => {
            console.error('Failed to add favorite', err);
            this.error.set('Failed to add favorite');
          }
        });
      }
    }
  }

  onCardClick(_book: DisplayBook): void {
    // External books have no local detail route
  }

  isFavorite(book: DisplayBook): boolean {
    if (book.isExternal && book.isbn) {
      return this.favoriteIsbns().has(book.isbn);
    }
    return book.id ? this.favoriteBookIds().has(book.id) : false;
  }

  trackByBookId(_index: number, book: DisplayBook): string {
    return book.isExternal ? (book.isbn || '') : (book.id?.toString() || '');
  }

  retryLoad(): void {
    if (this.searchMode() === 'search' && this.currentQuery) {
      this.onSearch(this.currentQuery);
    } else {
      this.loadNewReleases();
    }
  }
}
