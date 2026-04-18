import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Profile {
  fullName: string;
  linkedinUrl: string;
  githubUrl: string;
  leetcodeUrl: string;
  coverPhoto: string;
  profilePic: string;
}

export interface Experience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  logo: string;
  color: string;
}

export interface EducationContent {
  degree: string;
  field: string;
  institution: string;
  location: string;
  year: string;
  grade: string;
  highlights: string[];
}

export interface EducationFile {
  id: string;
  name: string;
  icon: string;
  content: EducationContent;
}

export interface EducationFolder {
  id: string;
  type: string;
  name: string;
  icon: string;
  expanded: boolean;
  files: EducationFile[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private profileSubject = new BehaviorSubject<Profile | null>(null);
  private experiencesSubject = new BehaviorSubject<Experience[]>([]);
  private skillsSubject = new BehaviorSubject<string[]>([]);
  private educationSubject = new BehaviorSubject<EducationFolder[]>([]);

  profile$ = this.profileSubject.asObservable();
  experiences$ = this.experiencesSubject.asObservable();
  skills$ = this.skillsSubject.asObservable();
  education$ = this.educationSubject.asObservable();

  constructor() {
    this.loadAllData();
  }

  private async loadAllData(): Promise<void> {
    await Promise.all([
      this.loadProfile(),
      this.loadExperiences(),
      this.loadSkills(),
      this.loadEducation()
    ]);
  }

  private async loadProfile(): Promise<void> {
    try {
      const response = await fetch('data/profile.json');
      const data = await response.json();
      this.profileSubject.next(data);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  }

  private async loadExperiences(): Promise<void> {
    try {
      const response = await fetch('data/experience.json');
      const data = await response.json();
      this.experiencesSubject.next(data);
    } catch (error) {
      console.error('Failed to load experience data:', error);
    }
  }

  private async loadSkills(): Promise<void> {
    try {
      const response = await fetch('data/skills.json');
      const data = await response.json();
      this.skillsSubject.next(data);
    } catch (error) {
      console.error('Failed to load skills data:', error);
    }
  }

  private async loadEducation(): Promise<void> {
    try {
      const response = await fetch('data/education.json');
      const data = await response.json();
      this.educationSubject.next(data);
    } catch (error) {
      console.error('Failed to load education data:', error);
    }
  }

  // Sync getters for current values
  get profile(): Profile | null {
    return this.profileSubject.value;
  }

  get experiences(): Experience[] {
    return this.experiencesSubject.value;
  }

  get skills(): string[] {
    return this.skillsSubject.value;
  }

  get education(): EducationFolder[] {
    return this.educationSubject.value;
  }
}
