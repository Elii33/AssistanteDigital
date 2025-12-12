import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process.component.html',
  styleUrl: './process.component.css'
})
export class ProcessComponent {
  processSteps = [
    {
      number: 1,
      title: 'Prise de contact & cadrage',
      description: 'Échange pour comprendre vos besoins, objectifs et contraintes.',
      icon: '💬'
    },
    {
      number: 2,
      title: 'Proposition & devis détaillé',
      description: 'Proposition technique et commerciale adaptée à votre projet.',
      icon: '📋'
    },
    {
      number: 3,
      title: 'Développement',
      description: 'Réalisation de votre projet avec points réguliers d\'avancement.',
      icon: '⚙️'
    },
    {
      number: 4,
      title: 'Recette & mise en ligne',
      description: 'Tests, validation et déploiement de votre solution.',
      icon: '🚀'
    },
    {
      number: 5,
      title: 'Formation & accompagnement',
      description: 'Formation pour une prise en main autonome et support post-livraison.',
      icon: '🎓'
    }
  ];
}
