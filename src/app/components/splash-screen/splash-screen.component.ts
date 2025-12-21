import { Component, OnInit, OnDestroy, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.css'
})
export class SplashScreenComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() enterSite = new EventEmitter<void>();
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  isExiting = false;
  private liquidApp: any;
  private dropSound: HTMLAudioElement | null = null;

  ngOnInit(): void {
    // Créer le son de goutte d'eau (utilise un son synthétisé via Web Audio API)
    this.initDropSound();
  }

  private initDropSound(): void {
    // On va créer un son synthétique de goutte d'eau avec Web Audio API
    // car c'est plus léger qu'un fichier audio externe
  }

  private playDropSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Créer un oscillateur pour le son de goutte
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Son de goutte d'eau : fréquence qui descend rapidement
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);

      // Volume qui diminue
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      // Ajouter un deuxième "plop" léger
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();

        osc2.connect(gain2);
        gain2.connect(audioContext.destination);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

        gain2.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.15);
      }, 50);

    } catch (error) {
      console.log('Audio non supporté');
    }
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initLiquidBackground();
  }

  ngOnDestroy(): void {
    // Cleanup si nécessaire
  }

  private async initLiquidBackground(): Promise<void> {
    try {
      // Import dynamique du module
      const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js' as any);
      const LiquidBackground = module.default;

      const canvas = this.canvasRef.nativeElement;
      this.liquidApp = LiquidBackground(canvas);

      // Créer une texture personnalisée avec dégradé doré (sans texte)
      const textureCanvas = document.createElement('canvas');
      textureCanvas.width = 1024;
      textureCanvas.height = 1024;
      const ctx = textureCanvas.getContext('2d');

      if (ctx) {
        // Dégradé radial doré/beige
        const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 600);
        gradient.addColorStop(0, '#ca8a04');    // Gold center
        gradient.addColorStop(0.3, '#a16207');  // Darker gold
        gradient.addColorStop(0.6, '#78350f');  // Brown
        gradient.addColorStop(1, '#1c1917');    // Dark

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);

        // Ajouter quelques cercles pour un effet plus intéressant
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 1024;
          const r = 50 + Math.random() * 150;
          const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
          circleGradient.addColorStop(0, '#eab308');
          circleGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = circleGradient;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Charger la texture personnalisée
      this.liquidApp.loadImage(textureCanvas.toDataURL());

      // Configuration du matériau
      this.liquidApp.liquidPlane.material.metalness = 0.8;
      this.liquidApp.liquidPlane.material.roughness = 0.2;
      this.liquidApp.liquidPlane.uniforms.displacementScale.value = 4;

      // Activer l'effet de goutte d'eau au clic
      this.liquidApp.setRain(true);

      // Gestion du resize
      window.addEventListener('resize', this.handleResize.bind(this));

      // Ajouter un effet de goutte au clic sur le canvas
      canvas.addEventListener('click', (e: MouseEvent) => {
        if (this.liquidApp?.addDrop) {
          // Convertir les coordonnées du clic en coordonnées normalisées
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          // Ajouter une goutte à la position du clic
          this.liquidApp.addDrop(x, y, 0.03, 0.04);
        }
      });

      // Effet au mouvement de la souris aussi
      canvas.addEventListener('mousemove', (e: MouseEvent) => {
        if (this.liquidApp?.addDrop && Math.random() > 0.92) {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          this.liquidApp.addDrop(x, y, 0.01, 0.01);
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du fond liquide:', error);
    }
  }

  private handleResize(): void {
    if (this.liquidApp?.resize) {
      this.liquidApp.resize();
    }
  }

  onEnterClick(): void {
    // Jouer le son de goutte d'eau
    this.playDropSound();

    this.isExiting = true;
    // Attendre la fin de l'animation avant d'émettre
    setTimeout(() => {
      this.enterSite.emit();
    }, 800);
  }
}
