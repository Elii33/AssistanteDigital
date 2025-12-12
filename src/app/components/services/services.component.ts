import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  servicesVisible = false;

  ngOnInit() {
    this.checkVisibility();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.checkVisibility();
  }

  private checkVisibility() {
    const element = document.getElementById('services');
    if (element) {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      this.servicesVisible = rect.top < windowHeight * 0.75;
    }
  }
}
