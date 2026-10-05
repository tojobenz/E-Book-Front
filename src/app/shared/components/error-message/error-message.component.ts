import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, Message, Button],
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent {
  @Input() message = 'An error occurred';
  @Input() retryAction: (() => void) | null = null;

  @Output() retry = new EventEmitter<void>();

  handleRetry(): void {
    if (this.retryAction) {
      this.retryAction();
    }
    this.retry.emit();
  }
}
