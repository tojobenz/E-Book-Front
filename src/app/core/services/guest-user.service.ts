import { Injectable } from '@angular/core';

const STORAGE_KEY = 'ebook.clientId';

@Injectable({
  providedIn: 'root'
})
export class GuestUserService {
  /** Stable guest id for this browser (no login). */
  getClientId(): string {
    const existing = localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  }
}
