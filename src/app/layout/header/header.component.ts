import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Menubar, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly items: MenuItem[] = [
    { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Books', icon: 'pi pi-book', routerLink: '/books' },
    { label: 'Favorites', icon: 'pi pi-star', routerLink: '/favorites' }
  ];
}
