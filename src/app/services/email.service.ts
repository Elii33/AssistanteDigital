import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Clés EmailJS - Configuré pour ElisAssist
  private serviceId = 'service_ugrbmwr';
  private templateId = 'template_3uz2spk';
  private publicKey = 'pdsy07zUPUZgThsFh';

  constructor() {
    // Initialiser EmailJS avec votre clé publique
    emailjs.init(this.publicKey);
  }

  async sendEmail(formData: any): Promise<any> {
    try {
      const templateParams = {
        name: formData.name,
        email: formData.email,
        projectType: formData.projectType,
        message: formData.message
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('Email envoyé avec succès!', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }
}
