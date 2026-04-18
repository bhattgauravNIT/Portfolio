import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss'
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = true;
  currentLang = 'en-us';

  constructor(public translateService: TranslateService) {}

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.body.classList.add('light-mode');
    }

    // Subscribe to language changes
    this.translateService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleLanguage(): void {
    const newLang = this.currentLang === 'en-us' ? 'de' : 'en-us';
    this.translateService.setLanguage(newLang);
  }

  t(key: string): string {
    return this.translateService.translate(key);
  }
}
