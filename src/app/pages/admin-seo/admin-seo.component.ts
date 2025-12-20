/**
 * ============================================================================
 * Dashboard Admin SEO - Analyse TF-IDF
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * ============================================================================
 */

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TFIDFService, DocumentAnalysis, TFIDFResult, ContentSuggestion } from '../../services/tfidf.service';

interface PageContent {
  name: string;
  url: string;
  content: string;
  title: string;
}

@Component({
  selector: 'app-admin-seo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-seo.component.html',
  styleUrls: ['./admin-seo.component.css']
})
export class AdminSeoComponent implements OnInit {
  // Onglet actif
  activeTab: 'analyzer' | 'keywords' | 'comparison' | 'settings' = 'analyzer';

  // Données d'analyse
  currentAnalysis: DocumentAnalysis | null = null;
  contentSuggestions: ContentSuggestion[] = [];
  isAnalyzing = false;

  // Input utilisateur
  customContent = '';
  customTitle = '';
  customUrl = '';

  // Mots-clés
  targetKeywords: string[] = [];
  newKeyword = '';

  // Comparaison
  comparisonDoc1 = '';
  comparisonDoc2 = '';
  comparisonResult: {
    similarity: number;
    commonTerms: string[];
    uniqueToDoc1: string[];
    uniqueToDoc2: string[];
  } | null = null;

  // Pages du site à analyser
  sitePages: PageContent[] = [];

  constructor(
    private tfidfService: TFIDFService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.targetKeywords = this.tfidfService.getTargetKeywords();

    if (isPlatformBrowser(this.platformId)) {
      this.loadSitePages();
    }
  }

  /**
   * Charge le contenu des pages du site
   */
  private loadSitePages(): void {
    // Contenu des pages principales (extrait automatiquement ou défini manuellement)
    this.sitePages = [
      {
        name: 'Page d\'accueil',
        url: '/',
        title: 'Assistante Virtuelle & Digitale | Automatisation Notion Make Canva',
        content: this.getHomePageContent()
      },
      {
        name: 'Qui suis-je',
        url: '/qui-suis-je',
        title: 'Qui suis-je - Assistante Digitale',
        content: this.getWhoAmIContent()
      }
    ];
  }

  /**
   * Contenu de la page d'accueil (à synchroniser avec le vrai contenu)
   */
  private getHomePageContent(): string {
    return `
      Assistante Virtuelle Digitale Automatisation Notion Make Canva
      Je simplifie ton quotidien d'entrepreneure avec des solutions digitales sur-mesure.
      Automatisation, organisation, création visuelle et gestion administrative.
      Gagne du temps, libère ta charge mentale et concentre-toi sur ce qui compte vraiment.
      Services proposés: Automatisation et productivité avec Notion Make Zapier.
      Gestion administrative et réseaux sociaux.
      Création visuelle avec Canva.
      Accompagnement personnalisé pour entrepreneurs et TPE PME.
    `;
  }

  /**
   * Contenu de la page Qui suis-je
   */
  private getWhoAmIContent(): string {
    return `
      Je suis quelqu'un qui aime quand les choses deviennent claires, simples et respirables.
      Même quand, au départ, tout est flou.
      Je travaille avec des personnes qui ont trop d'idées ou pas encore assez,
      qui avancent par à-coups, qui savent qu'il y a quelque chose à construire.
      Je ne crois pas aux systèmes parfaits ni aux méthodes toutes faites.
      Je crois aux outils bien choisis, aux process adaptés à ta réalité,
      et à une organisation qui te soulage au lieu de t'enfermer.
      Avec moi, pas de pression inutile, pas de jargon.
      On fait le tri, on priorise, on clarifie.
      Je suis là pour être le cerveau calme quand tout s'embrouille,
      la personne qui voit clair quand toi tu n'y arrives plus,
      le soutien discret mais fiable derrière ton business.
    `;
  }

  /**
   * Analyse une page du site
   */
  analyzePage(page: PageContent): void {
    this.isAnalyzing = true;

    setTimeout(() => {
      this.currentAnalysis = this.tfidfService.analyzeDocument(
        page.content,
        page.url,
        page.title
      );
      this.contentSuggestions = this.tfidfService.suggestContentImprovements(this.currentAnalysis);
      this.isAnalyzing = false;
    }, 500);
  }

  /**
   * Analyse un contenu personnalisé
   */
  analyzeCustomContent(): void {
    if (!this.customContent.trim()) return;

    this.isAnalyzing = true;

    setTimeout(() => {
      this.currentAnalysis = this.tfidfService.analyzeDocument(
        this.customContent,
        this.customUrl || '/custom',
        this.customTitle || 'Contenu personnalisé'
      );
      this.contentSuggestions = this.tfidfService.suggestContentImprovements(this.currentAnalysis);
      this.isAnalyzing = false;
    }, 500);
  }

  /**
   * Ajoute un mot-clé cible
   */
  addKeyword(): void {
    if (this.newKeyword.trim()) {
      this.tfidfService.addTargetKeyword(this.newKeyword.trim());
      this.targetKeywords = this.tfidfService.getTargetKeywords();
      this.newKeyword = '';
    }
  }

  /**
   * Supprime un mot-clé cible
   */
  removeKeyword(keyword: string): void {
    this.tfidfService.removeTargetKeyword(keyword);
    this.targetKeywords = this.tfidfService.getTargetKeywords();
  }

  /**
   * Compare deux documents
   */
  compareDocuments(): void {
    if (!this.comparisonDoc1.trim() || !this.comparisonDoc2.trim()) return;

    this.comparisonResult = this.tfidfService.compareDocuments(
      this.comparisonDoc1,
      this.comparisonDoc2
    );
  }

  /**
   * Obtient la classe CSS pour le score SEO
   */
  getSEOScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  }

  /**
   * Obtient le label pour le score SEO
   */
  getSEOScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'À améliorer';
  }

  /**
   * Obtient la classe CSS pour la priorité
   */
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  }

  /**
   * Obtient l'icône pour l'action suggérée
   */
  getActionIcon(action: string): string {
    switch (action) {
      case 'increase': return '↑';
      case 'decrease': return '↓';
      default: return '✓';
    }
  }

  /**
   * Formate le pourcentage de densité
   */
  formatDensity(density: number): string {
    return density.toFixed(2) + '%';
  }

  /**
   * Obtient les entrées de la map keywordDensity
   */
  getKeywordDensityEntries(): { keyword: string; density: number }[] {
    if (!this.currentAnalysis?.keywordDensity) return [];

    const entries: { keyword: string; density: number }[] = [];
    this.currentAnalysis.keywordDensity.forEach((density, keyword) => {
      entries.push({ keyword, density });
    });

    return entries.sort((a, b) => b.density - a.density);
  }
}
