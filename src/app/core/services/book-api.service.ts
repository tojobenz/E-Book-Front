import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Book, CreateBook, UpdateBook, BookPaginatedResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBooks(
    search?: string,
    author?: string,
    page: number = 1,
    pageSize: number = 20,
    sortBy?: string,
    ascending: boolean = true
  ): Observable<BookPaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('ascending', ascending.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (author) {
      params = params.set('author', author);
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get<BookPaginatedResponse>(`${this.apiUrl}/books`, { params });
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
  }

  createBook(book: CreateBook): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/books`, book);
  }

  updateBook(id: number, book: UpdateBook): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/books/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/books/${id}`);
  }
}
