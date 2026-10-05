import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, InputText, IconField, InputIcon, Button],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnDestroy {
  @Output() search = new EventEmitter<string>();

  searchTerm = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  onInputChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.onSearch();
    }, 3000);
  }

  onSearch(): void {
    this.search.emit(this.searchTerm);
  }

  clearSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTerm = '';
    this.search.emit('');
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}
