import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';

import { BookApiService } from '../../../../core/services/book-api.service';
import { FavoriteApiService } from '../../../../core/services/favorite-api.service';
import { Book } from '../../../../core/models/book.model';

import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-book-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Card,
    Button,
    Tag,
    Divider,
    LoadingComponent,
    ErrorMessageComponent
  ],
  templateUrl: './book-details-page.component.html',
  styleUrls: ['./book-details-page.component.scss']
})
export class BookDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookApiService = inject(BookApiService);
  private favoriteApiService = inject(FavoriteApiService);

  readonly book = signal<Book | null>(null);
  readonly isFavorite = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private bookId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookId = +id;
      this.loadBook(this.bookId);
      this.checkFavorite(this.bookId);
    }
  }

  loadBook(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookApiService.getBook(id).subscribe({
      next: (book) => {
        this.book.set(book);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load book details');
        this.loading.set(false);
      }
    });
  }

  checkFavorite(id: number): void {
    this.favoriteApiService.getFavorites().subscribe({
      next: (favorites) => {
        this.isFavorite.set(favorites.some(f => f.bookId === id));
      },
      error: (err) => {
        console.error('Failed to check favorite status', err);
      }
    });
  }

  toggleFavorite(): void {
    const current = this.book();
    if (!current) return;

    if (this.isFavorite()) {
      this.favoriteApiService.removeLocalFavorite(current.id).subscribe({
        next: () => {
          this.isFavorite.set(false);
        },
        error: (err: any) => {
          console.error('Failed to remove favorite', err);
        }
      });
    } else {
      this.favoriteApiService.addLocalFavorite(current.id).subscribe({
        next: () => {
          this.isFavorite.set(true);
        },
        error: (err: any) => {
          console.error('Failed to add favorite', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  retryLoad(): void {
    if (this.bookId !== null) {
      this.loadBook(this.bookId);
    }
  }
}
