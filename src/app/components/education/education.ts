import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import { DataService, EducationFolder, EducationFile } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.html',
  styleUrl: './education.scss'
})
export class EducationComponent implements OnInit, OnDestroy {
  private langSubscription?: Subscription;
  private dataSubscription?: Subscription;

  education: EducationFolder[] = [];
  selectedFile: EducationFile | null = null;
  openTabs: EducationFile[] = [];
  activeTabId: string | null = null;

  constructor(
    public translateService: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translateService.currentLanguage$.subscribe(() => {
      // Force change detection when language changes
    });

    this.dataSubscription = this.dataService.education$.subscribe(education => {
      this.education = education.map(folder => ({ ...folder, expanded: false }));
      // Auto-open first file
      if (education.length > 0 && education[0].files.length > 0) {
        this.education[0].expanded = true;
        this.openFile(education[0].files[0]);
      }
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  t(key: string): string {
    return this.translateService.translate(key);
  }

  toggleFolder(folder: EducationFolder): void {
    folder.expanded = !folder.expanded;
  }

  openFile(file: EducationFile): void {
    this.selectedFile = file;
    this.activeTabId = file.id;
    
    // Add to tabs if not already open
    if (!this.openTabs.find(t => t.id === file.id)) {
      this.openTabs.push(file);
    }
  }

  closeTab(file: EducationFile, event: Event): void {
    event.stopPropagation();
    const index = this.openTabs.findIndex(t => t.id === file.id);
    if (index > -1) {
      this.openTabs.splice(index, 1);
      
      // If closing active tab, switch to another
      if (this.activeTabId === file.id) {
        if (this.openTabs.length > 0) {
          const newActive = this.openTabs[Math.min(index, this.openTabs.length - 1)];
          this.selectedFile = newActive;
          this.activeTabId = newActive.id;
        } else {
          this.selectedFile = null;
          this.activeTabId = null;
        }
      }
    }
  }

  selectTab(file: EducationFile): void {
    this.selectedFile = file;
    this.activeTabId = file.id;
  }

  isFileSelected(file: EducationFile): boolean {
    return this.activeTabId === file.id;
  }
}
