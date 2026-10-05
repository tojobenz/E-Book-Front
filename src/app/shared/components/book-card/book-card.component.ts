import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { PrimeTemplate } from 'primeng/api';

import { Book } from '../../../core/models/book.model';

interface BookCardInput {
  id?: number;
  isbn?: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  isAvailable?: boolean;
  availability?: string;
  isExternal?: boolean;
}

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, Card, Button, Tag, PrimeTemplate],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss']
})
export class BookCardComponent {
  @Input() book!: Book | BookCardInput;
  @Input() isFavorite = false;
  @Input() isExternal = false;

  @Output() favoriteToggle = new EventEmitter<Book | BookCardInput>();
  @Output() cardClick = new EventEmitter<Book | BookCardInput>();

  handleFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit(this.book);
  }

  handleCardClick(): void {
    this.cardClick.emit(this.book);
  }

  getBookId(): number | string | undefined {
    if (this.isExternal) {
      return (this.book as BookCardInput).isbn;
    }
    return (this.book as Book).id;
  }

  getBookTitle(): string {
    if (this.isExternal) {
      return (this.book as BookCardInput).title;
    }
    return (this.book as Book).title;
  }

  getBookAuthor(): string {
    if (this.isExternal) {
      return (this.book as BookCardInput).author;
    }
    return (this.book as Book).author;
  }

  getBookDescription(): string | undefined {
    if (this.isExternal) {
      return (this.book as BookCardInput).description;
    }
    return (this.book as Book).description;
  }

  getBookCoverUrl(): string | undefined {
    if (this.isExternal) {
      return (this.book as BookCardInput).coverUrl;
    }
    return (this.book as Book).coverUrl;
  }

  getBookPublishedDate(): string | undefined {
    if (this.isExternal) {
      return (this.book as BookCardInput).publishedDate;
    }
    return (this.book as Book).publishedDate;
  }

  getBookAvailability(): { isAvailable?: boolean; availability?: string } | undefined {
    if (this.isExternal) {
      const bookInput = this.book as BookCardInput;
      return {
        isAvailable: bookInput.isAvailable,
        availability: bookInput.availability
      };
    }
    return undefined;
  }
}
