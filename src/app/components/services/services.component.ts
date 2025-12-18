import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService, HourlyService } from '../../services/stripe.service';

interface ServiceHourlyDisplay extends HourlyService {
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

  // Services avec tarif horaire (chargés depuis Stripe)
  hourlyServices: ServiceHourlyDisplay[] = [];
  isLoadingServices = true;

  // Loading states pour les boutons de paiement horaire
  isLoadingHourly: { [key: string]: boolean } = {};

  constructor(private stripeService: StripeService) {}

  async ngOnInit() {
    this.checkVisibility();
    await this.loadHourlyServices();
  }

  // Charger les services horaires depuis Stripe
  private async loadHourlyServices() {
    this.isLoadingServices = true;
    try {
      const services = await this.stripeService.getHourlyServices();
      this.hourlyServices = services.map(service => ({
        ...service,
        selectedHours: 2 // Valeur par défaut
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      // Fallback avec des valeurs par défaut si le backend n'est pas disponible
      this.hourlyServices = [
        { id: 'admin', name: 'Gestion Administrative', hourlyRate: null, minHours: 1, maxHours: 40, configured: false, selectedHours: 2 },
        { id: 'automation', name: 'Automatisation & Design', hourlyRate: null, minHours: 1, maxHours: 40, configured: false, selectedHours: 2 },
        { id: 'social', name: 'Gestion Réseaux Sociaux', hourlyRate: null, minHours: 1, maxHours: 40, configured: false, selectedHours: 2 }
      ];
    } finally {
      this.isLoadingServices = false;
    }
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
  getService(index: number): ServiceHourlyDisplay {
    return this.hourlyServices[index] || {
      id: '',
      name: '',
      hourlyRate: null,
      minHours: 1,
      maxHours: 40,
      configured: false,
      selectedHours: 2
    };
  }

  calculateTotal(index: number): number {
    const service = this.hourlyServices[index];
    if (!service || !service.hourlyRate) return 0;
    return service.hourlyRate * service.selectedHours;
  }

  incrementHours(index: number): void {
    const service = this.hourlyServices[index];
    if (service && service.selectedHours < service.maxHours) {
      service.selectedHours++;
    }
  }

  decrementHours(index: number): void {
    const service = this.hourlyServices[index];
    if (service && service.selectedHours > service.minHours) {
      service.selectedHours--;
    }
  }

  async payHourly(index: number): Promise<void> {
    const service = this.hourlyServices[index];

    if (!service.configured || !service.hourlyRate) {
      alert('Ce service n\'est pas encore configuré. Veuillez contacter l\'administrateur.');
      return;
    }

    this.isLoadingHourly[service.id] = true;

    try {
      await this.stripeService.redirectToHourlyCheckout(
        service.id,
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
