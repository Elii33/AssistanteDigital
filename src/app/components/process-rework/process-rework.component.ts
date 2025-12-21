import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  state,
  query,
  stagger,
  keyframes,
  group
} from '@angular/animations';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import lottie, { AnimationItem } from 'lottie-web';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ProcessStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  lottieIcon?: string;
}

@Component({
  selector: 'app-process-rework',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process-rework.component.html',
  styleUrl: './process-rework.component.css',
  animations: [
    // Header entrance animation
    trigger('headerEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('800ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ]),

    // Tag pulse animation
    trigger('tagPulse', [
      state('pulse', style({ transform: 'scale(1)' })),
      transition('* => pulse', [
        animate('600ms ease-out', keyframes([
          style({ transform: 'scale(0.8)', opacity: 0, offset: 0 }),
          style({ transform: 'scale(1.1)', opacity: 1, offset: 0.6 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),

    // Step card animation
    trigger('stepCard', [
      state('closed', style({
        transform: 'scale(1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      })),
      state('open', style({
        transform: 'scale(1.02)',
        boxShadow: '0 20px 60px rgba(202, 138, 4, 0.3)'
      })),
      transition('closed <=> open', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),

    // Content expand animation
    trigger('expandContent', [
      transition(':enter', [
        style({ height: 0, opacity: 0, transform: 'translateY(-20px)' }),
        group([
          animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ height: '*', transform: 'translateY(0)' })
          ),
          animate('300ms 100ms ease-out',
            style({ opacity: 1 })
          )
        ])
      ]),
      transition(':leave', [
        group([
          animate('300ms ease-in',
            style({ opacity: 0, transform: 'translateY(-10px)' })
          ),
          animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ height: 0 })
          )
        ])
      ])
    ]),

    // Feature list stagger
    trigger('featureList', [
      transition(':enter', [
        query('.feature-item', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(80, [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'translateX(0)' })
            )
          ])
        ], { optional: true })
      ])
    ]),

    // Image transition
    trigger('imageTransition', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(1.2) translateX(50px)',
          filter: 'blur(10px)'
        }),
        animate('700ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({
            opacity: 1,
            transform: 'scale(1) translateX(0)',
            filter: 'blur(0)'
          })
        )
      ]),
      transition(':leave', [
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 0,
            transform: 'scale(0.9) translateX(-50px)',
            filter: 'blur(5px)'
          })
        )
      ])
    ]),

    // Navigation buttons
    trigger('navButton', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0) rotate(-180deg)' }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'scale(1) rotate(0)' })
        )
      ]),
      transition(':leave', [
        animate('300ms ease-in',
          style({ opacity: 0, transform: 'scale(0) rotate(180deg)' })
        )
      ])
    ]),

    // Floating particles
    trigger('floatingParticle', [
      state('float', style({ transform: 'translateY(0)' })),
      transition('* => float', [
        animate('3s ease-in-out', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY(-15px)', offset: 0.5 }),
          style({ transform: 'translateY(0)', offset: 1 })
        ]))
      ])
    ]),

    // Shimmer effect
    trigger('shimmer', [
      state('active', style({})),
      transition('* => active', [
        animate('1.5s ease-in-out', keyframes([
          style({ backgroundPosition: '-200% 0', offset: 0 }),
          style({ backgroundPosition: '200% 0', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class ProcessReworkComponent implements AfterViewInit, OnDestroy {
  @ViewChild('processSection') processSection!: ElementRef;
  @ViewChild('lottieContainer') lottieContainer!: ElementRef;
  @ViewChildren('stepLottie') stepLotties!: QueryList<ElementRef>;

  activeStep = 0;
  isVisible = false;
  headerAnimState = '';
  tagAnimState = '';
  particleState = 'float';

  private scrollTriggers: ScrollTrigger[] = [];
  private lottieAnimations: Map<number, AnimationItem> = new Map();
  private particleInterval: any;


  steps: ProcessStep[] = [
    {
      number: '01',
      title: 'Premier Contact',
      subtitle: 'Échange pour comprendre vos besoins',
      description: 'Nous commençons par un appel découverte gratuit de 30 minutes. C\'est l\'occasion d\'échanger sur vos défis quotidiens, vos objectifs et de voir comment je peux vous accompagner efficacement.',
      features: [
        'Analyse de vos besoins spécifiques',
        'Identification des tâches chronophages',
        'Discussion sur vos outils actuels'
      ],
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&auto=format&fit=crop'
    },
    {
      number: '02',
      title: 'Proposition Personnalisée',
      subtitle: 'Un devis adapté à votre situation',
      description: 'Suite à notre échange, je vous envoie une proposition détaillée avec les solutions adaptées à vos besoins et un devis transparent sans surprise.',
      features: [
        'Détail des services proposés',
        'Planning d\'intervention prévu',
        'Tarification claire et flexible'
      ],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop'
    },
    {
      number: '03',
      title: 'Mise en Place',
      subtitle: 'Configuration et organisation',
      description: 'Je prends en main vos outils et processus. Configuration de Notion, création d\'automatisations Make/Zapier, mise en place des workflows optimisés.',
      features: [
        'Configuration des outils choisis',
        'Création des automatisations',
        'Formation à l\'utilisation'
      ],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'
    },
    {
      number: '04',
      title: 'Collaboration Continue',
      subtitle: 'Un partenariat sur le long terme',
      description: 'Je deviens votre bras droit digital. Communication régulière, ajustements selon vos retours, et optimisation continue de vos processus.',
      features: [
        'Points réguliers de suivi',
        'Ajustements en continu',
        'Support réactif par message'
      ],
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop'
    }
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initScrollAnimations();
      this.initLottieAnimations();
      this.startParticleAnimation();
    }, 100);
  }

  ngOnDestroy(): void {
    // Clean up ScrollTriggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Clean up Lottie animations
    this.lottieAnimations.forEach(anim => anim.destroy());
    this.lottieAnimations.clear();

    // Clear interval
    if (this.particleInterval) {
      clearInterval(this.particleInterval);
    }
  }

  private initLottieAnimations(): void {
    // Initialize main Lottie animation for the active step icon
    const containers = document.querySelectorAll('.lottie-icon');
    containers.forEach((container, index) => {
      if (container && index < this.steps.length) {
        try {
          const anim = lottie.loadAnimation({
            container: container as Element,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: `https://assets2.lottiefiles.com/packages/lf20_${this.getLottieId(index)}.json`
          });
          this.lottieAnimations.set(index, anim);

          // Play animation for active step
          if (index === this.activeStep) {
            anim.play();
          }
        } catch (e) {
          console.log('Lottie animation not loaded for step', index);
        }
      }
    });
  }

  private getLottieId(index: number): string {
    // Different Lottie animation IDs for each step
    const ids = ['jcikn9tn', 'qm8eqkex', 'kfu5egts', 'w51pcehl'];
    return ids[index] || ids[0];
  }

  private startParticleAnimation(): void {
    // Restart particle floating animation every 3 seconds
    this.particleInterval = setInterval(() => {
      this.particleState = '';
      setTimeout(() => {
        this.particleState = 'float';
      }, 50);
    }, 3000);
  }

  private initScrollAnimations(): void {
    const section = this.processSection?.nativeElement;
    if (!section) return;

    // Main reveal animation
    const mainReveal = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      onEnter: () => {
        this.isVisible = true;
        this.headerAnimState = 'visible';
        this.tagAnimState = 'pulse';
      },
      onLeaveBack: () => {
        this.isVisible = false;
      }
    });
    this.scrollTriggers.push(mainReveal);

    // Header parallax
    const header = section.querySelector('.process-header');
    if (header) {
      gsap.fromTo(header,
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            end: 'top 40%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // Title text reveal with split effect
    const title = section.querySelector('.process-title');
    if (title) {
      gsap.fromTo(title,
        {
          backgroundSize: '0% 100%',
          opacity: 0
        },
        {
          backgroundSize: '100% 100%',
          opacity: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // Content card 3D entrance
    const content = section.querySelector('.process-content');
    if (content) {
      gsap.fromTo(content,
        {
          opacity: 0,
          rotateX: 15,
          y: 100,
          transformPerspective: 1000
        },
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: content,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // Details pills cascade animation
    const details = section.querySelectorAll('.process-details');
    details.forEach((detail: Element, index: number) => {
      gsap.fromTo(detail,
        {
          opacity: 0,
          x: -100,
          rotateY: -30,
          scale: 0.8
        },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: details[0],
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Images magnetic effect
    const imagesCol = section.querySelector('.images-column');
    if (imagesCol) {
      gsap.fromTo(imagesCol,
        {
          opacity: 0,
          x: 150,
          scale: 0.85,
          rotateY: 20
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: imagesCol,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // Parallax on scroll
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const progress = self.progress;

        // Parallax images
        const imgWrappers = section.querySelectorAll('.img-block.visible .img-wrapper');
        imgWrappers.forEach((img: Element) => {
          gsap.to(img, {
            y: (progress - 0.5) * 40,
            duration: 0.3,
            ease: 'none'
          });
        });

        // Rotate decorative elements
        const decorations = section.querySelectorAll('.floating-decoration');
        decorations.forEach((deco: Element, i: number) => {
          gsap.to(deco, {
            rotation: progress * 360 * (i % 2 === 0 ? 1 : -1),
            duration: 0.5,
            ease: 'none'
          });
        });
      }
    });
    this.scrollTriggers.push(st);

    ScrollTrigger.refresh();
  }

  onToggle(index: number, event: Event): void {
    const details = event.target as HTMLDetailsElement;
    if (details.open) {
      const previousStep = this.activeStep;
      this.activeStep = index;

      // Play Lottie animation for new step
      this.lottieAnimations.forEach((anim, i) => {
        if (i === index) {
          anim.goToAndPlay(0);
        } else {
          anim.stop();
        }
      });

      // GSAP animation for content
      const content = details.querySelector('.details-content');
      if (content) {
        gsap.fromTo(content,
          { opacity: 0, y: -30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out'
          }
        );

        // Animate features list
        const features = content.querySelectorAll('.feature-item');
        gsap.fromTo(features,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.2
          }
        );
      }

      // Animate image transition
      this.animateImageTransition(previousStep, index);
    }
  }

  private animateImageTransition(from: number, to: number): void {
    const section = this.processSection?.nativeElement;
    if (!section) return;

    const imgBlocks = section.querySelectorAll('.img-block');

    // Animate out
    if (from >= 0 && imgBlocks[from + 1]) {
      const outWrapper = imgBlocks[from + 1].querySelector('.img-wrapper');
      gsap.to(outWrapper, {
        opacity: 0,
        scale: 0.9,
        x: -80,
        filter: 'blur(8px)',
        duration: 0.4,
        ease: 'power2.in'
      });
    }

    // Animate in with wow effect
    if (to >= 0 && imgBlocks[to + 1]) {
      const inWrapper = imgBlocks[to + 1].querySelector('.img-wrapper');
      gsap.fromTo(inWrapper,
        {
          opacity: 0,
          scale: 1.3,
          x: 100,
          filter: 'blur(15px)',
          rotateY: 15
        },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          filter: 'blur(0px)',
          rotateY: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out'
        }
      );

      // Add sparkle effect
      this.createSparkles(imgBlocks[to + 1] as HTMLElement);
    }
  }

  private createSparkles(container: HTMLElement): void {
    // Create temporary sparkle particles
    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle-particle';
      sparkle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 100;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      container.appendChild(sparkle);

      gsap.fromTo(sparkle,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 2,
          opacity: 0,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => sparkle.remove()
        }
      );
    }
  }

  nextStep(): void {
    const prevStep = this.activeStep;
    this.activeStep = (this.activeStep + 1) % this.steps.length;
    this.animateStepChange(prevStep, this.activeStep, 'next');
    this.playStepLottie(this.activeStep);
  }

  previousStep(): void {
    const prevStep = this.activeStep;
    this.activeStep = (this.activeStep - 1 + this.steps.length) % this.steps.length;
    this.animateStepChange(prevStep, this.activeStep, 'prev');
    this.playStepLottie(this.activeStep);
  }

  private playStepLottie(index: number): void {
    this.lottieAnimations.forEach((anim, i) => {
      if (i === index) {
        anim.goToAndPlay(0);
      } else {
        anim.stop();
      }
    });
  }

  private animateStepChange(from: number, to: number, direction: 'next' | 'prev'): void {
    const section = this.processSection?.nativeElement;
    if (!section) return;

    const imgBlocks = section.querySelectorAll('.img-block');
    const xOffset = direction === 'next' ? 100 : -100;

    // Animate out with rotation
    if (from >= 0 && imgBlocks[from + 1]) {
      gsap.to(imgBlocks[from + 1].querySelector('.img-wrapper'), {
        opacity: 0,
        x: -xOffset,
        scale: 0.85,
        rotateY: direction === 'next' ? -15 : 15,
        filter: 'blur(10px)',
        duration: 0.4,
        ease: 'power2.in'
      });
    }

    // Animate in with 3D effect
    if (to >= 0 && imgBlocks[to + 1]) {
      gsap.fromTo(imgBlocks[to + 1].querySelector('.img-wrapper'),
        {
          opacity: 0,
          x: xOffset,
          scale: 1.2,
          rotateY: direction === 'next' ? 15 : -15,
          filter: 'blur(15px)'
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          rotateY: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          delay: 0.25,
          ease: 'power3.out'
        }
      );
    }

    // Animate step indicators
    const details = section.querySelectorAll('.process-details');
    details.forEach((detail: Element, i: number) => {
      if (i === to) {
        gsap.to(detail, {
          scale: 1.05,
          duration: 0.3,
          ease: 'back.out(2)'
        });
        setTimeout(() => {
          gsap.to(detail, { scale: 1, duration: 0.2 });
        }, 300);
      }
    });
  }

  closeAll(): void {
    this.activeStep = -1;

    // Stop all Lottie animations
    this.lottieAnimations.forEach(anim => anim.stop());

    const section = this.processSection?.nativeElement;
    if (section) {
      const defaultImg = section.querySelector('.img-block.default-img .img-wrapper');
      if (defaultImg) {
        gsap.fromTo(defaultImg,
          {
            opacity: 0,
            scale: 1.2,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.6,
            ease: 'power2.out'
          }
        );
      }
    }
  }

  getStepState(index: number): string {
    return this.activeStep === index ? 'open' : 'closed';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
