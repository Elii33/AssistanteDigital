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
    { name: 'Java 8 / 17 / 21', category: 'backend' },
    { name: 'Spring Boot', category: 'backend' },
    { name: 'Spring Security', category: 'backend' },
    { name: 'Spring Data JPA', category: 'backend' },
    { name: 'Hibernate', category: 'backend' },
    { name: 'Spring Batch', category: 'backend' },
    { name: 'Angular 17+', category: 'frontend' },
    { name: 'HTML5 / CSS3', category: 'frontend' },
    { name: 'TailwindCSS', category: 'frontend' },
    { name: 'TypeScript', category: 'frontend' },
    { name: 'WordPress', category: 'cms' },
    { name: 'ACF Pro', category: 'cms' },
    { name: 'Git / GitHub / GitLab', category: 'tools' },
    { name: 'Docker / docker-compose', category: 'devops' },
    { name: 'GitHub Actions', category: 'devops' },
    { name: 'MySQL / PostgreSQL', category: 'database' },
    { name: 'JUnit / Mockito', category: 'testing' },
    { name: 'Cypress E2E', category: 'testing' }
  ];

  getSkillsByCategory(category: string) {
    return this.skills.filter(skill => skill.category === category);
  }
}
