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
    { name: 'Notion', category: 'organisation', icon: 'assets/icons/notion.svg' },
    { name: 'Trello', category: 'organisation', icon: 'assets/icons/trello.svg' },
    { name: 'Google Workspace', category: 'organisation', icon: 'assets/icons/google.svg' },
    { name: 'Miro', category: 'organisation', icon: 'assets/icons/miro.svg' },
    { name: 'Loom', category: 'organisation', icon: 'assets/icons/loom.svg' },
    { name: 'Calendly', category: 'organisation', icon: 'assets/icons/calendly.svg' },
    // Automatisation & Workflows
    { name: 'Make', category: 'automatisation', icon: 'assets/icons/make.svg' },
    { name: 'System.io', category: 'automatisation', icon: 'assets/icons/systemio.svg' },
    { name: 'ConvertKit', category: 'automatisation', icon: 'assets/icons/convertkit.svg' },
    { name: 'ManyChat', category: 'automatisation', icon: 'assets/icons/manychat.svg' },
    { name: 'n8n', category: 'automatisation', icon: 'assets/icons/n8n.svg' },
    { name: 'Airtable', category: 'automatisation', icon: 'assets/icons/airtable.svg' },
    { name: 'IA', category: 'automatisation', icon: 'assets/icons/ai.svg' },
    // Design & Création
    { name: 'Canva', category: 'design', icon: 'assets/icons/canva.svg' },
    { name: 'CapCut', category: 'design', icon: 'assets/icons/capcut.svg' },
    { name: 'Adobe', category: 'design', icon: 'assets/icons/adobe.svg' },
    // Réseaux Sociaux & Marketing
    { name: 'Instagram', category: 'social', icon: 'assets/icons/instagram.svg' },
    { name: 'TikTok', category: 'social', icon: 'assets/icons/tiktok.svg' },
    { name: 'LinkedIn', category: 'social', icon: 'assets/icons/linkedin.svg' },
    { name: 'Facebook', category: 'social', icon: 'assets/icons/facebook.svg' },
    { name: 'Meta Business Suite', category: 'social', icon: 'assets/icons/meta.svg' },
    { name: 'Meta Ads Manager', category: 'social', icon: 'assets/icons/meta.svg' },
    { name: 'Google Analytics', category: 'social', icon: 'assets/icons/googleanalytics.svg' },
    // Communication & Collaboration
    { name: 'Slack', category: 'communication', icon: 'assets/icons/slack.svg' },
    { name: 'Discord', category: 'communication', icon: 'assets/icons/discord.svg' },
    { name: 'Zoom', category: 'communication', icon: 'assets/icons/zoom.svg' },
    { name: 'Gmail', category: 'communication', icon: 'assets/icons/gmail.svg' },
    { name: 'Google Meet', category: 'communication', icon: 'assets/icons/googlemeet.svg' },
    { name: 'WhatsApp', category: 'communication', icon: 'assets/icons/whatsapp.svg' },
    // No-Code & E-commerce
    { name: 'Shopify', category: 'nocode', icon: 'assets/icons/shopify.svg' },
    { name: 'WordPress', category: 'nocode', icon: 'assets/icons/wordpress.svg' },
    { name: 'Webflow', category: 'nocode', icon: 'assets/icons/webflow.svg' },
    { name: 'Wix', category: 'nocode', icon: 'assets/icons/wix.svg' }
  ];

  getSkillsByCategory(category: string) {
    return this.skills.filter(skill => skill.category === category);
  }
}
