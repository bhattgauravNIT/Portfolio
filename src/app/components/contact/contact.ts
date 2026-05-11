import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../services/translate.service';
import { Subscription } from 'rxjs';

interface ChatMessage {
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationStep {
  id: string;
  question: string;
  field: string;
  inputType: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  options?: string[];
  validation?: RegExp;
  errorMessage?: string;
  nextStep?: string | ((value: string) => string);
  isEnd?: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('inputField') inputField!: ElementRef;

  private langSubscription?: Subscription;

  messages: ChatMessage[] = [];
  currentInput = '';
  currentStepId = 'greeting';
  isTyping = false;
  isComplete = false;
  formData: Record<string, string> = {};

  // Branching conversation flow
  conversationFlow: Record<string, ConversationStep> = {
    // Initial greeting
    greeting: {
      id: 'greeting',
      question: "Hello! I'm X1E, your virtual assistant. I'd love to help you connect with Gaurav. What's your name?",
      field: 'name',
      inputType: 'text',
      nextStep: 'reason'
    },

    // Main reason selection
    reason: {
      id: 'reason',
      question: "Nice to meet you, {name}! What brings you here today?",
      field: 'reason',
      inputType: 'select',
      options: [
        'Job Opportunity',
        'Technical Consultation',
        'Just saying hi',
        'Other'
      ],
      nextStep: (value: string) => {
        switch (value) {
          case 'Job Opportunity': return 'job_company';
          case 'Technical Consultation': return 'consult_email';
          case 'Just saying hi': return 'hello_response';
          case 'Other': return 'other_reason';
          default: return 'other_reason';
        }
      }
    },

    // ================== JOB OPPORTUNITY FLOW ==================
    job_company: {
      id: 'job_company',
      question: "That's exciting! 🎯 Please mention the company name you're representing.",
      field: 'company',
      inputType: 'text',
      nextStep: 'job_recruiter_email'
    },
    job_recruiter_email: {
      id: 'job_recruiter_email',
      question: "Great! Could you please share your official recruiter email address?",
      field: 'recruiter_email',
      inputType: 'email',
      validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: "Hmm, that doesn't look like a valid email. Could you try again?",
      nextStep: 'job_resume'
    },
    job_resume: {
      id: 'job_resume',
      question: "Would you like to have Gaurav's resume?",
      field: 'wants_resume',
      inputType: 'select',
      options: ['Yes, please!', 'No, thank you'],
      nextStep: 'job_complete'
    },
    job_complete: {
      id: 'job_complete',
      question: "Thank you for reaching out about this opportunity at {company}! 🚀 I will be sharing the details shortly on the provided email: {recruiter_email}. Have a great day!",
      field: '',
      inputType: 'text',
      isEnd: true
    },

    // ================== TECHNICAL CONSULTATION FLOW ==================
    consult_email: {
      id: 'consult_email',
      question: "I'd be happy to help arrange a consultation! 🧠 Please share your email address.",
      field: 'email',
      inputType: 'email',
      validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: "That doesn't look like a valid email. Could you try again?",
      nextStep: 'consult_phone'
    },
    consult_phone: {
      id: 'consult_phone',
      question: "And your phone number where Gaurav can reach you?",
      field: 'phone',
      inputType: 'phone',
      validation: /^[\d\s\+\-\(\)]{7,20}$/,
      errorMessage: "Please enter a valid phone number.",
      nextStep: 'consult_details'
    },
    consult_details: {
      id: 'consult_details',
      question: "Could you share a few details about what you need help with?",
      field: 'consultation_details',
      inputType: 'textarea',
      nextStep: 'consult_complete'
    },
    consult_complete: {
      id: 'consult_complete',
      question: "Thank you, {name}! 💡 I've noted down your requirements. Gaurav will get back to you soon at {email} or {phone}. Have a wonderful day!",
      field: '',
      inputType: 'text',
      isEnd: true
    },

    // ================== JUST SAYING HI FLOW ==================
    hello_response: {
      id: 'hello_response',
      question: "Hello, {name}! 👋 Gaurav is saying hello back! It's always nice to connect with friendly people. Feel free to connect with him on LinkedIn: https://www.linkedin.com/in/gaurav-kumar/ 🌟 Have an amazing day!",
      field: '',
      inputType: 'text',
      isEnd: true
    },

    // ================== OTHER FLOW ==================
    other_reason: {
      id: 'other_reason',
      question: "No problem! Could you tell me more about why you'd like to connect with Gaurav?",
      field: 'other_reason_details',
      inputType: 'textarea',
      nextStep: 'other_email'
    },
    other_email: {
      id: 'other_email',
      question: "Thanks for sharing! Please provide your email address.",
      field: 'email',
      inputType: 'email',
      validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: "That doesn't look like a valid email. Could you try again?",
      nextStep: 'other_phone'
    },
    other_phone: {
      id: 'other_phone',
      question: "And your phone number?",
      field: 'phone',
      inputType: 'phone',
      validation: /^[\d\s\+\-\(\)]{7,20}$/,
      errorMessage: "Please enter a valid phone number.",
      nextStep: 'other_complete'
    },
    other_complete: {
      id: 'other_complete',
      question: "Thank you, {name}! 📝 I've recorded your message. Gaurav will reach out to you at {email} or {phone} soon. Take care!",
      field: '',
      inputType: 'text',
      isEnd: true
    }
  };

  constructor(public translateService: TranslateService) {}

  ngOnInit(): void {
    this.langSubscription = this.translateService.currentLanguage$.subscribe(() => {
      // Force change detection when language changes
    });

    // Start conversation after a short delay
    setTimeout(() => this.askCurrentQuestion(), 500);
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  t(key: string): string {
    return this.translateService.translate(key);
  }

  getCurrentStep(): ConversationStep | null {
    return this.conversationFlow[this.currentStepId] || null;
  }

  askCurrentQuestion(): void {
    const step = this.getCurrentStep();
    if (!step) {
      this.isComplete = true;
      return;
    }

    let question = step.question;

    // Replace placeholders with actual values
    Object.keys(this.formData).forEach(key => {
      question = question.replace(new RegExp(`\\{${key}\\}`, 'g'), this.formData[key]);
    });

    this.isTyping = true;
    this.messages.push({
      type: 'bot',
      text: '',
      timestamp: new Date(),
      isTyping: true
    });

    this.scrollToBottom();

    // Simulate typing delay
    setTimeout(() => {
      this.messages[this.messages.length - 1] = {
        type: 'bot',
        text: question,
        timestamp: new Date(),
        isTyping: false
      };
      this.isTyping = false;
      this.scrollToBottom();

      if (step.isEnd) {
        this.isComplete = true;
      } else {
        setTimeout(() => this.focusInput(), 100);
      }
    }, 1000 + Math.random() * 500);
  }

  submitInput(): void {
    const step = this.getCurrentStep();
    if (!step) return;

    if (!this.currentInput.trim() && step.inputType !== 'select') {
      return;
    }

    const input = this.currentInput.trim();

    // Validate input
    if (step.validation && !step.validation.test(input)) {
      this.addBotMessage(step.errorMessage || 'Invalid input. Please try again.');
      return;
    }

    // Add user message
    this.messages.push({
      type: 'user',
      text: input,
      timestamp: new Date()
    });

    // Store form data
    if (step.field) {
      this.formData[step.field] = input;
    }

    this.currentInput = '';
    this.scrollToBottom();

    // Determine next step
    if (step.nextStep) {
      if (typeof step.nextStep === 'function') {
        this.currentStepId = step.nextStep(input);
      } else {
        this.currentStepId = step.nextStep;
      }
      // Ask next question after a short delay
      setTimeout(() => this.askCurrentQuestion(), 500);
    } else {
      this.isComplete = true;
    }
  }

  selectOption(option: string): void {
    this.currentInput = option;
    this.submitInput();
  }

  addBotMessage(text: string): void {
    this.isTyping = true;
    this.messages.push({
      type: 'bot',
      text: '',
      timestamp: new Date(),
      isTyping: true
    });

    setTimeout(() => {
      this.messages[this.messages.length - 1] = {
        type: 'bot',
        text: text,
        timestamp: new Date(),
        isTyping: false
      };
      this.isTyping = false;
      this.scrollToBottom();
    }, 800);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        const container = this.chatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  focusInput(): void {
    if (!this.inputField) {
      return;
    }

    // Avoid pulling the whole page to the contact section on app startup.
    const inputEl = this.inputField.nativeElement as HTMLElement;
    const rect = inputEl.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible) {
      inputEl.focus();
    }
  }

  restartConversation(): void {
    this.messages = [];
    this.currentStepId = 'greeting';
    this.currentInput = '';
    this.formData = {};
    this.isComplete = false;
    setTimeout(() => this.askCurrentQuestion(), 500);
  }
}
