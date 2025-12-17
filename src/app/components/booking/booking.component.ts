import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    Calendly: any;
  }
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('particleCanvas', { static: false }) particleCanvas!: ElementRef<HTMLCanvasElement>;

  calendlyUrl = 'https://calendly.com/elisaarb/appel-decouverte';
  isLoading = true;
  private isBrowser: boolean;

  // Effet 3D sur les cartes
  cardTransforms: string[] = ['', '', ''];

  // Particules
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // Mouse position pour effet de lumière
  mouseX = 0;
  mouseY = 0;
  isMouseInSection = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadCalendlyScript();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser && this.particleCanvas) {
      this.initParticles();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    const script = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    if (script) {
      script.remove();
    }
  }

  // ===== PARTICULES ANIMÉES =====
  private initParticles(): void {
    const canvas = this.particleCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Créer les particules
    const particleCount = 50;
    const colors = ['#ca8a04', '#eab308', '#fbbf24', '#d4a574', '#a3865a'];

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    this.animateParticles();
  }

  private resizeCanvas(): void {
    if (!this.particleCanvas) return;
    const canvas = this.particleCanvas.nativeElement;
    const section = canvas.parentElement;
    if (section) {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    }
  }

  private animateParticles(): void {
    if (!this.ctx || !this.particleCanvas) return;

    const canvas = this.particleCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.particles.forEach((particle, index) => {
      // Mouvement
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Rebond sur les bords
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

      // Dessiner la particule avec glow
      if (this.ctx) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Lignes de connexion entre particules proches
        this.particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            this.ctx!.save();
            this.ctx!.globalAlpha = (1 - distance / 120) * 0.15;
            this.ctx!.strokeStyle = particle.color;
            this.ctx!.lineWidth = 0.5;
            this.ctx!.beginPath();
            this.ctx!.moveTo(particle.x, particle.y);
            this.ctx!.lineTo(otherParticle.x, otherParticle.y);
            this.ctx!.stroke();
            this.ctx!.restore();
          }
        });
      }
    });

    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  // ===== EFFET LUMIÈRE SOURIS =====
  onMouseMove(event: MouseEvent): void {
    if (!this.isBrowser) return;
    const section = (event.currentTarget as HTMLElement);
    const rect = section.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  onMouseEnter(): void {
    this.isMouseInSection = true;
  }

  onMouseLeave(): void {
    this.isMouseInSection = false;
  }

  getSpotlightStyle(): { [key: string]: string } {
    if (!this.isMouseInSection) {
      return { opacity: '0' };
    }
    return {
      opacity: '1',
      background: `radial-gradient(600px circle at ${this.mouseX}px ${this.mouseY}px, rgba(202, 138, 4, 0.15), transparent 40%)`
    };
  }

  // ===== CALENDLY =====
  private loadCalendlyScript(): void {
    if (window.Calendly) {
      this.isLoading = false;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => {
      this.isLoading = false;
    };
    script.onerror = () => {
      console.error('Erreur lors du chargement de Calendly');
      this.isLoading = false;
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  openCalendlyPopup(): void {
    if (this.isBrowser && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: this.calendlyUrl,
        prefill: {},
        utm: {}
      });
    }
  }

  // ===== EFFET 3D CARTES =====
  onCardMouseMove(event: MouseEvent, index: number): void {
    if (!this.isBrowser) return;

    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 8;
    const rotateY = (centerX - x) / 8;

    this.cardTransforms[index] = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  }

  onCardMouseLeave(index: number): void {
    this.cardTransforms[index] = '';
  }
}
