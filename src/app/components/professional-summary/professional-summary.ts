import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-professional-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-summary.html',
  styleUrl: './professional-summary.scss'
})
export class ProfessionalSummaryComponent implements OnInit, OnDestroy {
  private langSubscription?: Subscription;

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
}
