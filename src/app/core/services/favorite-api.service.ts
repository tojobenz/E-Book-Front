import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Favorite } from '../models/favorite.model';
import { ExternalBook } from '../models/external-book.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`);
  }

  addLocalFavorite(bookId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites/local/${bookId}`, {});
  }

  addExternalFavorite(externalBook: ExternalBook): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites/external`, externalBook);
  }

  removeLocalFavorite(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/local/${bookId}`);
  }

  removeExternalFavorite(isbn: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/external/${encodeURIComponent(isbn)}`);
  }
}
