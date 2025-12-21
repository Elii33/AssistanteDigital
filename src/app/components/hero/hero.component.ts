// Hero Component - Explode effect on scroll
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {

  ngOnInit(): void {
    this.updateExplodeEffect();
  } 
  ngOnDestroy(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.updateExplodeEffect();
  }

  private updateExplodeEffect(): void {
    const scrollY = window.scrollY;
    const maxScroll = 300; // Distance de scroll pour reconstruire complètement
    const progress = Math.min(scrollY / maxScroll, 1);

    document.documentElement.style.setProperty('--explode-progress', progress.toString());
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
