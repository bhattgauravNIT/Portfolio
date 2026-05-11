import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import { DataService, Experience } from '../../services/data.service';
import { Subscription } from 'rxjs';

interface ChartData {
  company: string;
  shortName: string;
  months: number;
  duration: string;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
  pathData: string;
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss'
})
export class ExperienceComponent implements OnInit, OnDestroy {
  private langSubscription?: Subscription;
  private dataSubscription?: Subscription;

  experiences: Experience[] = [];
  chartData: ChartData[] = [];

  constructor(
    public translateService: TranslateService,
    private dataService: DataService
  ) {}

  t(key: string): string {
    return this.translateService.translate(key);
  }

  ngOnInit(): void {
    this.langSubscription = this.translateService.currentLanguage$.subscribe(() => {
      // Force change detection when language changes
    });
    
    this.dataSubscription = this.dataService.experiences$.subscribe(experiences => {
      this.experiences = experiences;
      if (experiences.length > 0) {
        this.generateChartData();
      }
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  generateChartData(): void {
    const totalMonths = this.experiences.reduce((sum, exp) => sum + this.getMonths(exp.startDate, exp.endDate), 0);
    
    let currentAngle = -90; // Start from top
    const data = this.experiences.map((exp) => {
      const months = this.getMonths(exp.startDate, exp.endDate);
      const percentage = (months / totalMonths) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      
      return {
        company: exp.company,
        shortName: this.getShortName(exp.company),
        months,
        duration: this.calculateDuration(exp.startDate, exp.endDate),
        percentage,
        color: exp.color,
        startAngle,
        endAngle,
        pathData: this.describeArc(100, 100, 80, startAngle, endAngle)
      };
    });

    this.chartData = data;
  }

  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', x, y,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  }

  getShortName(company: string): string {
    const normalized = company.trim();
    if (!normalized) {
      return '';
    }

    const words = normalized.split(/\s+/).filter(Boolean);

    // Keep short names as-is for readability.
    if (normalized.length <= 12) {
      return normalized;
    }

    // Multi-word names become initials, for example: Tata Consultancy Services -> TCS.
    if (words.length > 1) {
      return words
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
    }

    // Long single-word names are trimmed to keep legend compact.
    return `${normalized.slice(0, 12)}...`;
  }

  getMonths(startDate: string, endDate: string): number {
    const parseDate = (dateStr: string): Date => {
      if (dateStr === 'Present') return new Date();
      const [month, year] = dateStr.split(' ');
      const monthIndex = new Date(Date.parse(month + ' 1, 2000')).getMonth();
      return new Date(parseInt(year), monthIndex);
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    // Use non-overlapping month ranges to avoid double-counting transition months
    // between adjacent roles (for example, one role ending and another starting in May).
    if (endDate !== 'Present' && months === 0) {
      return 1;
    }

    return Math.max(months, 0);
  }

  getTotalExperience(): string {
    // Include all experience including internships
    const totalMonths = this.experiences.reduce((sum, exp) => {
      return sum + this.getMonths(exp.startDate, exp.endDate);
    }, 0);

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) {
      return `${months} mo${months !== 1 ? 's' : ''}`;
    }
    if (months === 0) {
      return `${years} yr${years !== 1 ? 's' : ''}`;
    }
    return `${years} yr${years !== 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
  }

  calculateDuration(startDate: string, endDate: string): string {
    const months = this.getMonths(startDate, endDate);
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} yr${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} yr${years !== 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
    }
  }
}
