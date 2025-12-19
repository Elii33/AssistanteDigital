import { Component } from '@angular/core';

@Component({
  selector: 'app-recognition',
  standalone: true,
  imports: [],
  templateUrl: './recognition.component.html',
  styleUrl: './recognition.component.css'
})
export class RecognitionComponent {

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
