import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Clés EmailJS - À CONFIGURER après création du compte
  private serviceId = 'mon_email_service_ldng';
  private templateId = 'template_c5a9snv';
  private publicKey = 'ivNsCLAyvZHZ38jSb';

  constructor() {
    // Initialiser EmailJS avec votre clé publique
    emailjs.init(this.publicKey);
  }

  async sendEmail(formData: any): Promise<any> {
    try {
      const templateParams = {
        from_name: formData.name, 
        from_email: formData.email,
        project_type: formData.projectType,
        message: formData.message,
        to_email: 'derisbourgarnaud@gmail.com'
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
