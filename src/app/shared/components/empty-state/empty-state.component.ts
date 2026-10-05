import { Component, Input } from '@angular/core';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [Message],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() message = 'No items found';
  @Input() icon = 'pi pi-inbox';
}
