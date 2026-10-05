import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, Card, Button, PrimeTemplate],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  constructor(private router: Router) {}

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  navigateToFavorites(): void {
    this.router.navigate(['/favorites']);
  }
}
