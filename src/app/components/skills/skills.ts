import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class SkillsComponent implements OnInit, OnDestroy {
  private langSubscription?: Subscription;
  private dataSubscription?: Subscription;

  skills: string[] = [];

  constructor(
    public translateService: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translateService.currentLanguage$.subscribe(() => {
      // Force change detection when language changes
    });
    
    this.dataSubscription = this.dataService.skills$.subscribe(skills => {
      this.skills = skills;
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  t(key: string): string {
    return this.translateService.translate(key);
  }
}
