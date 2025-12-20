/**
 * ============================================================================
 * Service TF-IDF pour l'analyse SEO
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * ============================================================================
 */

import { Injectable } from '@angular/core';

export interface TFIDFResult {
  term: string;
  tf: number;      // Term Frequency
  idf: number;     // Inverse Document Frequency
  tfidf: number;   // TF-IDF Score
  count: number;   // Nombre d'occurrences
}

export interface DocumentAnalysis {
  url: string;
  title: string;
  wordCount: number;
  uniqueWords: number;
  topTerms: TFIDFResult[];
  keywordDensity: Map<string, number>;
  readabilityScore: number;
  seoScore: number;
  recommendations: string[];
}

export interface ContentSuggestion {
  keyword: string;
  currentDensity: number;
  recommendedDensity: number;
  action: 'increase' | 'decrease' | 'maintain';
  priority: 'high' | 'medium' | 'low';
}

@Injectable({
  providedIn: 'root'
})
export class TFIDFService {
  // Mots vides français à ignorer
  private stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi',
    'dont', 'où', 'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta',
    'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos',
    'leurs', 'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
    'me', 'te', 'se', 'lui', 'en', 'y', 'ne', 'pas', 'plus', 'moins',
    'très', 'bien', 'mal', 'pour', 'par', 'avec', 'sans', 'sous', 'sur',
    'dans', 'entre', 'vers', 'chez', 'être', 'avoir', 'faire', 'dire',
    'aller', 'voir', 'savoir', 'pouvoir', 'vouloir', 'devoir', 'falloir',
    'comme', 'tout', 'tous', 'toute', 'toutes', 'autre', 'autres', 'même',
    'aussi', 'encore', 'alors', 'ainsi', 'si', 'quand', 'comment', 'pourquoi',
    'est', 'sont', 'était', 'été', 'suis', 'es', 'sommes', 'êtes', 'ai',
    'as', 'avons', 'avez', 'ont', 'avait'
  ]);

  // Mots-clés cibles pour le SEO (assistante virtuelle)
  private targetKeywords = [
    'assistante virtuelle', 'assistante digitale', 'automatisation',
    'notion', 'make', 'canva', 'productivité', 'organisation',
    'gestion administrative', 'workflow', 'entrepreneur', 'freelance',
    'tpe', 'pme', 'réseaux sociaux', 'zapier', 'optimisation'
  ];

  // Corpus de référence pour IDF (simplifié)
  private referenceCorpus: string[] = [];

  /**
   * Tokenise et nettoie le texte
   */
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents pour la comparaison
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  /**
   * Calcule la fréquence des termes (TF)
   */
  calculateTF(tokens: string[]): Map<string, number> {
    const termFreq = new Map<string, number>();
    const totalTerms = tokens.length;

    tokens.forEach(token => {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    });

    // Normalise par le nombre total de termes
    termFreq.forEach((count, term) => {
      termFreq.set(term, count / totalTerms);
    });

    return termFreq;
  }

  /**
   * Calcule l'IDF (Inverse Document Frequency)
   */
  calculateIDF(term: string, documents: string[]): number {
    const docsContainingTerm = documents.filter(doc =>
      doc.toLowerCase().includes(term)
    ).length;

    if (docsContainingTerm === 0) {
      return Math.log(documents.length + 1);
    }

    return Math.log(documents.length / docsContainingTerm);
  }

  /**
   * Calcule le score TF-IDF pour un document
   */
  calculateTFIDF(text: string, referenceDocuments?: string[]): TFIDFResult[] {
    const tokens = this.tokenize(text);
    const tf = this.calculateTF(tokens);
    const docs = referenceDocuments || this.referenceCorpus;

    const results: TFIDFResult[] = [];

    // Compte les occurrences brutes
    const rawCounts = new Map<string, number>();
    tokens.forEach(token => {
      rawCounts.set(token, (rawCounts.get(token) || 0) + 1);
    });

    tf.forEach((tfValue, term) => {
      const idf = docs.length > 0 ? this.calculateIDF(term, docs) : 1;
      const tfidf = tfValue * idf;

      results.push({
        term,
        tf: tfValue,
        idf,
        tfidf,
        count: rawCounts.get(term) || 0
      });
    });

    // Trie par score TF-IDF décroissant
    return results.sort((a, b) => b.tfidf - a.tfidf);
  }

  /**
   * Analyse complète d'une page
   */
  analyzeDocument(content: string, url: string, title: string): DocumentAnalysis {
    const tokens = this.tokenize(content);
    const tfidfResults = this.calculateTFIDF(content);
    const keywordDensity = this.calculateKeywordDensity(content);
    const readabilityScore = this.calculateReadability(content);
    const seoScore = this.calculateSEOScore(content, title, keywordDensity);
    const recommendations = this.generateRecommendations(content, keywordDensity, tfidfResults);

    return {
      url,
      title,
      wordCount: tokens.length,
      uniqueWords: new Set(tokens).size,
      topTerms: tfidfResults.slice(0, 20),
      keywordDensity,
      readabilityScore,
      seoScore,
      recommendations
    };
  }

  /**
   * Calcule la densité des mots-clés cibles
   */
  calculateKeywordDensity(text: string): Map<string, number> {
    const lowerText = text.toLowerCase();
    const wordCount = this.tokenize(text).length;
    const density = new Map<string, number>();

    this.targetKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = lowerText.match(regex);
      const count = matches ? matches.length : 0;
      density.set(keyword, (count / wordCount) * 100);
    });

    return density;
  }

  /**
   * Calcule un score de lisibilité simplifié
   */
  calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenize(text);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

    // Score simplifié (0-100)
    // Idéal: 15-20 mots par phrase, 5-6 lettres par mot
    let score = 100;

    if (avgWordsPerSentence > 25) score -= 20;
    else if (avgWordsPerSentence > 20) score -= 10;

    if (avgWordLength > 7) score -= 15;
    else if (avgWordLength > 6) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calcule un score SEO global
   */
  calculateSEOScore(content: string, title: string, keywordDensity: Map<string, number>): number {
    let score = 0;
    const maxScore = 100;

    // Titre (20 points)
    if (title.length >= 30 && title.length <= 60) score += 20;
    else if (title.length > 0) score += 10;

    // Longueur du contenu (20 points)
    const wordCount = this.tokenize(content).length;
    if (wordCount >= 300) score += 20;
    else if (wordCount >= 150) score += 10;

    // Densité des mots-clés (30 points)
    let keywordScore = 0;
    keywordDensity.forEach((density) => {
      if (density >= 0.5 && density <= 3) keywordScore += 5;
      else if (density > 0) keywordScore += 2;
    });
    score += Math.min(30, keywordScore);

    // Présence de mots-clés dans le titre (15 points)
    const titleLower = title.toLowerCase();
    let titleKeywordScore = 0;
    this.targetKeywords.forEach(kw => {
      if (titleLower.includes(kw)) titleKeywordScore += 5;
    });
    score += Math.min(15, titleKeywordScore);

    // Structure du contenu (15 points)
    if (content.includes('<h1') || content.includes('<h2')) score += 5;
    if (content.includes('<ul') || content.includes('<ol')) score += 5;
    if (content.includes('<strong') || content.includes('<em')) score += 5;

    return Math.min(maxScore, score);
  }

  /**
   * Génère des recommandations SEO
   */
  generateRecommendations(
    content: string,
    keywordDensity: Map<string, number>,
    tfidfResults: TFIDFResult[]
  ): string[] {
    const recommendations: string[] = [];
    const wordCount = this.tokenize(content).length;

    // Recommandations sur la longueur
    if (wordCount < 300) {
      recommendations.push(`Contenu trop court (${wordCount} mots). Visez au moins 300 mots pour un meilleur référencement.`);
    }

    // Recommandations sur les mots-clés
    keywordDensity.forEach((density, keyword) => {
      if (density === 0) {
        recommendations.push(`Le mot-clé "${keyword}" n'apparaît pas. Envisagez de l'intégrer naturellement.`);
      } else if (density < 0.5) {
        recommendations.push(`La densité du mot-clé "${keyword}" est faible (${density.toFixed(2)}%). Augmentez légèrement son utilisation.`);
      } else if (density > 3) {
        recommendations.push(`Attention: suroptimisation du mot-clé "${keyword}" (${density.toFixed(2)}%). Réduisez son utilisation.`);
      }
    });

    // Recommandations basées sur TF-IDF
    const topTerms = tfidfResults.slice(0, 5).map(r => r.term);
    const missingKeywords = this.targetKeywords.filter(kw =>
      !topTerms.some(t => kw.includes(t) || t.includes(kw))
    );

    if (missingKeywords.length > 0) {
      recommendations.push(`Mots-clés importants absents des termes principaux: ${missingKeywords.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Suggère des améliorations de contenu
   */
  suggestContentImprovements(analysis: DocumentAnalysis): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = [];

    analysis.keywordDensity.forEach((density, keyword) => {
      const recommendedDensity = 1.5; // Densité idéale
      let action: 'increase' | 'decrease' | 'maintain';
      let priority: 'high' | 'medium' | 'low';

      if (density < 0.5) {
        action = 'increase';
        priority = density === 0 ? 'high' : 'medium';
      } else if (density > 2.5) {
        action = 'decrease';
        priority = density > 4 ? 'high' : 'medium';
      } else {
        action = 'maintain';
        priority = 'low';
      }

      suggestions.push({
        keyword,
        currentDensity: density,
        recommendedDensity,
        action,
        priority
      });
    });

    // Trie par priorité
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Ajoute un document au corpus de référence
   */
  addToCorpus(document: string): void {
    this.referenceCorpus.push(document);
  }

  /**
   * Réinitialise le corpus
   */
  clearCorpus(): void {
    this.referenceCorpus = [];
  }

  /**
   * Compare deux documents
   */
  compareDocuments(doc1: string, doc2: string): {
    similarity: number;
    commonTerms: string[];
    uniqueToDoc1: string[];
    uniqueToDoc2: string[];
  } {
    const tokens1 = new Set(this.tokenize(doc1));
    const tokens2 = new Set(this.tokenize(doc2));

    const commonTerms = [...tokens1].filter(t => tokens2.has(t));
    const uniqueToDoc1 = [...tokens1].filter(t => !tokens2.has(t));
    const uniqueToDoc2 = [...tokens2].filter(t => !tokens1.has(t));

    const similarity = commonTerms.length / Math.max(tokens1.size, tokens2.size);

    return {
      similarity: Math.round(similarity * 100),
      commonTerms,
      uniqueToDoc1,
      uniqueToDoc2
    };
  }

  /**
   * Extrait les n-grammes (bi-grammes et tri-grammes)
   */
  extractNGrams(text: string, n: number = 2): Map<string, number> {
    const tokens = this.tokenize(text);
    const ngrams = new Map<string, number>();

    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join(' ');
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
    }

    return ngrams;
  }

  /**
   * Obtient les mots-clés cibles
   */
  getTargetKeywords(): string[] {
    return [...this.targetKeywords];
  }

  /**
   * Ajoute un mot-clé cible
   */
  addTargetKeyword(keyword: string): void {
    if (!this.targetKeywords.includes(keyword.toLowerCase())) {
      this.targetKeywords.push(keyword.toLowerCase());
    }
  }

  /**
   * Supprime un mot-clé cible
   */
  removeTargetKeyword(keyword: string): void {
    const index = this.targetKeywords.indexOf(keyword.toLowerCase());
    if (index > -1) {
      this.targetKeywords.splice(index, 1);
    }
  }
}
