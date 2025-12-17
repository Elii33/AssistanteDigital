import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../services/stripe.service';

interface ServiceHourly {
  id: string;
  name: string;
  hourlyRate: number;
  minHours: number;
  maxHours: number;
  selectedHours: number;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  servicesVisible = false;
  cardTransforms: string[] = ['', '', ''];

  // Gestion du portail client
  showPortalModal = false;
  portalEmail = '';
  isLoadingPortal = false;

  // Services avec tarif horaire
  hourlyServices: ServiceHourly[] = [
    {
      id: 'admin',
      name: 'Gestion Administrative',
      hourlyRate: 25,
      minHours: 1,
      maxHours: 40,
      selectedHours: 2
    },
    {
      id: 'automation',
      name: 'Automatisation & Design',
      hourlyRate: 35,
      minHours: 1,
      maxHours: 40,
      selectedHours: 2
    },
    {
      id: 'social',
      name: 'Gestion Réseaux Sociaux',
      hourlyRate: 30,
      minHours: 1,
      maxHours: 40,
      selectedHours: 2
    }
  ];

  // Loading states pour les boutons de paiement horaire
  isLoadingHourly: { [key: string]: boolean } = {};

  constructor(private stripeService: StripeService) {}

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

  onCardMouseMove(event: MouseEvent, cardIndex: number) {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    this.cardTransforms[cardIndex] = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  }

  onCardMouseLeave(cardIndex: number) {
    this.cardTransforms[cardIndex] = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }

  // Méthodes de paiement Stripe
  selectPlan(planId: string) {
    this.stripeService.redirectToCheckout(planId);
  }

  // Méthodes pour le sélecteur d'heures
  getService(index: number): ServiceHourly {
    return this.hourlyServices[index];
  }

  calculateTotal(index: number): number {
    const service = this.hourlyServices[index];
    return service.hourlyRate * service.selectedHours;
  }

  incrementHours(index: number): void {
    const service = this.hourlyServices[index];
    if (service.selectedHours < service.maxHours) {
      service.selectedHours++;
    }
  }

  decrementHours(index: number): void {
    const service = this.hourlyServices[index];
    if (service.selectedHours > service.minHours) {
      service.selectedHours--;
    }
  }

  async payHourly(index: number): Promise<void> {
    const service = this.hourlyServices[index];
    this.isLoadingHourly[service.id] = true;

    try {
      await this.stripeService.redirectToHourlyCheckout(
        service.id,
        service.name,
        service.hourlyRate,
        service.selectedHours
      );
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
    } finally {
      this.isLoadingHourly[service.id] = false;
    }
  }

  // Méthodes pour le portail client
  openPortalModal() {
    this.showPortalModal = true;
    this.portalEmail = '';
  }

  closePortalModal() {
    this.showPortalModal = false;
    this.portalEmail = '';
  }

  async accessCustomerPortal() {
    if (!this.portalEmail.trim()) {
      return;
    }

    this.isLoadingPortal = true;
    await this.stripeService.openCustomerPortal(this.portalEmail);
    this.isLoadingPortal = false;
  }
}
