import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm: FormGroup;
  formSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      projectType: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  async onSubmitContact() {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        // Envoyer l'email via EmailJS
        await this.emailService.sendEmail(this.contactForm.value);

        // Afficher le message de succès
        this.formSubmitted = true;
        this.contactForm.reset();

        // Cacher le message après 5 secondes
        setTimeout(() => {
          this.formSubmitted = false;
        }, 5000);
      } catch (error) {
        console.error('Erreur:', error);
        this.errorMessage = 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer ou me contacter directement par email.';
      } finally {
        this.isLoading = false;
      }
    } else {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
