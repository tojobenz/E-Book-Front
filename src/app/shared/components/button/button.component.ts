import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import type { ButtonSeverity } from 'primeng/types/button';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() disabled = false;
  @Input() loading = false;

  @Output() clicked = new EventEmitter<void>();

  get severity(): ButtonSeverity {
    switch (this.variant) {
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'danger';
      default:
        return undefined;
    }
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
