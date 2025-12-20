import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  skills = [
    // Organisation & Productivité
    { name: 'Notion', category: 'organisation', icon: '📝' },
    { name: 'Trello', category: 'organisation', icon: '📋' },
    { name: 'Google Workspace', category: 'organisation', icon: '📧' },
    { name: 'Miro', category: 'organisation', icon: '🎯' },
    { name: 'Loom', category: 'organisation', icon: '🎬' },
    { name: 'Calendly', category: 'organisation', icon: '📅' },
    // Automatisation & Workflows
    { name: 'Make', category: 'automatisation', icon: '⚡' },
    { name: 'System.io', category: 'automatisation', icon: '🔗' },
    { name: 'ConvertKit', category: 'automatisation', icon: '✉️' },
    { name: 'ManyChat', category: 'automatisation', icon: '💬' },
    { name: 'n8n', category: 'automatisation', icon: '🤖' },
    { name: 'Airtable', category: 'automatisation', icon: '🗃️' },
    { name: 'IA', category: 'automatisation', icon: '🧠' },
    // Design & Création
    { name: 'Canva', category: 'design', icon: '🎨' },
    { name: 'CapCut', category: 'design', icon: '🎬' },
    { name: 'Adobe', category: 'design', icon: '🖼️' },
    // Réseaux Sociaux & Marketing
    { name: 'Instagram', category: 'social', icon: '📸' },
    { name: 'TikTok', category: 'social', icon: '🎵' },
    { name: 'LinkedIn', category: 'social', icon: '💼' },
    { name: 'Facebook', category: 'social', icon: '👍' },
    { name: 'Meta Business Suite', category: 'social', icon: '📱' },
    { name: 'Meta Ads Manager', category: 'social', icon: '📊' },
    { name: 'Google Analytics', category: 'social', icon: '📈' },
    // Communication & Collaboration
    { name: 'Slack', category: 'communication', icon: '💬' },
    { name: 'Discord', category: 'communication', icon: '🎮' },
    { name: 'Zoom', category: 'communication', icon: '🎥' },
    { name: 'Gmail', category: 'communication', icon: '✉️' },
    { name: 'Google Meet', category: 'communication', icon: '📹' },
    { name: 'WhatsApp', category: 'communication', icon: '📲' },
    // No-Code & E-commerce
    { name: 'Shopify', category: 'nocode', icon: '🛍️' },
    { name: 'WordPress', category: 'nocode', icon: '📰' },
    { name: 'Webflow', category: 'nocode', icon: '🌐' },
    { name: 'Wix', category: 'nocode', icon: '✨' }
  ];

  getSkillsByCategory(category: string) {
    return this.skills.filter(skill => skill.category === category);
  }
}
