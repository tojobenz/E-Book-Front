import { Book } from './book.model';

export interface Favorite {
  id: number;
  bookId?: number;
  isbn?: string;
  title?: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  isAvailable?: boolean;
  availability?: string;
  book?: Book;
  createdAt: string;
}
