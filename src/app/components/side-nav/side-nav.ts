import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNavComponent implements OnInit, OnDestroy {
  isExpanded = true;
  @Output() navToggled = new EventEmitter<boolean>();
  private langSubscription?: Subscription;

  navItems = [
    { id: 'profile', labelKey: 'nav.profile', icon: 'person' },
    { id: 'summary', labelKey: 'nav.summary', icon: 'description' },
    { id: 'experience', labelKey: 'nav.experience', icon: 'work' },
    { id: 'skills', labelKey: 'nav.skills', icon: 'code' },
    { id: 'education', labelKey: 'nav.education', icon: 'school' },
    { id: 'contact', labelKey: 'nav.contact', icon: 'mail' }
  ];

  activeSection = 'profile';

  constructor(public translateService: TranslateService) {}

  ngOnInit(): void {
    this.langSubscription = this.translateService.currentLanguage$.subscribe(() => {
      // Force change detection when language changes
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  t(key: string): string {
    return this.translateService.translate(key);
  }

  toggleNav() {
    this.isExpanded = !this.isExpanded;
    this.navToggled.emit(this.isExpanded);
  }

  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
