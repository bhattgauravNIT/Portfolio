import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import { DataService, Profile } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.html',
  styleUrl: './profile-header.scss'
})
export class ProfileHeaderComponent implements OnInit, OnDestroy {
  profile: Profile | null = null;
  
  private langSubscription?: Subscription;
  private dataSubscription?: Subscription;

  constructor(
    public translateService: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translateService.currentLanguage$.subscribe(() => {
      // Force change detection when language changes
    });
    
    this.dataSubscription = this.dataService.profile$.subscribe(profile => {
      this.profile = profile;
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
