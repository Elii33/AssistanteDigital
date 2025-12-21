import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark' | 'dim';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent implements OnInit {
  currentTheme: Theme = 'light';
  isOpen = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        this.currentTheme = savedTheme;
        this.applyTheme(savedTheme);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeMenu();
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  selectTheme(theme: Theme): void {
    if (theme === this.currentTheme) {
      this.closeMenu();
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.closeMenu();

    if (this.isBrowser) {
      localStorage.setItem('theme', theme);
    }
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;

    document.body.classList.remove('theme-light', 'theme-dark', 'theme-dim');
    document.body.classList.add(`theme-${theme}`);
  }
}
