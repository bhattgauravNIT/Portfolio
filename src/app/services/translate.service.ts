import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private currentLang = new BehaviorSubject<string>('en-us');
  private translations: Record<string, any> = {};

  constructor() {
    // Load saved language preference
    const savedLang = localStorage.getItem('language') || 'en-us';
    this.setLanguage(savedLang);
  }

  get currentLanguage$(): Observable<string> {
    return this.currentLang.asObservable();
  }

  get currentLanguage(): string {
    return this.currentLang.value;
  }

  async setLanguage(lang: string): Promise<void> {
    try {
      const response = await fetch(`i18n/${lang}.json`);
      this.translations = await response.json();
      this.currentLang.next(lang);
      localStorage.setItem('language', lang);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English
      if (lang !== 'en-us') {
        await this.setLanguage('en-us');
      }
    }
  }

  translate(key: string): string {
    const keys = key.split('.');
    let result: any = this.translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  }

  t(key: string): string {
    return this.translate(key);
  }
}
