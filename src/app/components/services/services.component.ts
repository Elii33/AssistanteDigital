import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../services/stripe.service';

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
