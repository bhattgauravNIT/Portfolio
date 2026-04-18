import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileHeaderComponent } from './components/profile-header/profile-header';
import { SideNavComponent } from './components/side-nav/side-nav';
import { ProfessionalSummaryComponent } from './components/professional-summary/professional-summary';
import { ExperienceComponent } from './components/experience/experience';
import { SkillsComponent } from './components/skills/skills';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle';
import { EducationComponent } from './components/education/education';
import { ContactComponent } from './components/contact/contact';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProfileHeaderComponent, SideNavComponent, ProfessionalSummaryComponent, ExperienceComponent, SkillsComponent, ThemeToggleComponent, EducationComponent, ContactComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isNavExpanded = true;

  onNavToggled(expanded: boolean) {
    this.isNavExpanded = expanded;
  }
}
