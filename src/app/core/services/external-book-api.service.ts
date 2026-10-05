import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ExternalBook } from '../models/external-book.model';

@Injectable({
  providedIn: 'root'
})
export class ExternalBookApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchBooks(query: string, limit = 10, offset = 0): Observable<ExternalBook[]> {
    return this.http.get<ExternalBook[]>(`${this.apiUrl}/external/search`, {
      params: {
        query,
        limit: limit.toString(),
        offset: offset.toString()
      }
    });
  }

  getNewReleases(limit = 10, offset = 0): Observable<ExternalBook[]> {
    return this.http.get<ExternalBook[]>(`${this.apiUrl}/external/new`, {
      params: {
        limit: limit.toString(),
        offset: offset.toString()
      }
    });
  }

  getBookDetails(isbn: string): Observable<ExternalBook> {
    return this.http.get<ExternalBook>(`${this.apiUrl}/external/book/${encodeURIComponent(isbn)}`);
  }
}
