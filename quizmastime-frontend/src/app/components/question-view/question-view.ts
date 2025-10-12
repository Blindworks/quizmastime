import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuestionService } from '../../services/question';
import { UserQuestionService } from '../../services/user-question.service';
import { Question } from '../../models/question';
import { User } from '../../models/user';
import { AnswerSubmission } from '../../models/answer-submission';

@Component({
  selector: 'app-question-view',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './question-view.html',
  styleUrl: './question-view.scss'
})
export class QuestionView implements OnInit {
  currentUser: User | null = null;
  question: Question | null = null;
  day: number = 1;
  selectedAnswer: number | null = null;
  isAnswered: boolean = false;
  isCorrect: boolean = false;
  loading: boolean = true;
  answers: { text: string, index: number }[] = [];
  isLockedOut: boolean = false;
  lockoutMessage: string = '';
  lockoutRemainingMinutes: number = 0;

  constructor(
    private questionService: QuestionService,
    private userQuestionService: UserQuestionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Lade aktuellen User
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    if (!this.currentUser) {
      this.router.navigate(['/']);
      return;
    }

    // Lade Tag aus Route-Parameter
    this.route.params.subscribe(params => {
      this.day = +params['day'] || 1;
      this.loadQuestion();
    });
  }

  loadQuestion(): void {
    this.loading = true;
    // TODO: Frage für spezifischen Tag laden
    // Für jetzt laden wir die erste Frage
    this.questionService.getAllQuestions().subscribe({
      next: (questions) => {
        if (questions && questions.length >= this.day) {
          this.question = questions[this.day - 1];
          this.prepareAnswers();
          // Check lockout status after question is loaded
          this.checkLockoutStatus();
        } else {
          console.error('Keine Frage für Tag gefunden:', this.day);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Frage:', error);
        this.loading = false;
      }
    });
  }

  checkLockoutStatus(): void {
    if (!this.currentUser || !this.question) return;

    this.userQuestionService.checkLockoutStatus(this.currentUser.id!, this.question.id!).subscribe({
      next: (response) => {
        console.log('Lockout-Status beim Laden:', response);

        // Check if already answered correctly
        if (response.correct && response.userQuestion?.correctAnswerDate) {
          this.isAnswered = true;
          this.isCorrect = true;
          return;
        }

        // Check if locked out
        if (response.lockedOut) {
          this.isLockedOut = true;
          this.lockoutMessage = response.message;
          this.lockoutRemainingMinutes = Math.ceil((response.lockoutRemainingSeconds || 0) / 60);
          console.log('Türchen ist gesperrt für', this.lockoutRemainingMinutes, 'Minuten');
        }
      },
      error: (error) => {
        console.error('Fehler beim Prüfen des Lockout-Status:', error);
        // Continue anyway - user can try to answer
      }
    });
  }

  prepareAnswers(): void {
    if (!this.question) return;

    this.answers = [
      { text: this.question.answer1, index: 1 },
      { text: this.question.answer2, index: 2 },
      { text: this.question.answer3, index: 3 }
    ];

    // Shuffle answers for variety
    this.shuffleArray(this.answers);
  }

  shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  selectAnswer(answerIndex: number): void {
    if (this.isAnswered || this.isLockedOut) return;
    this.selectedAnswer = answerIndex;
    // Direkt absenden nach Auswahl
    this.submitAnswer();
  }

  submitAnswer(): void {
    if (this.selectedAnswer === null || !this.question || !this.currentUser) return;

    const submission: AnswerSubmission = {
      userId: this.currentUser.id!,
      questionId: this.question.id!,
      day: this.day,
      selectedAnswer: this.selectedAnswer
    };

    this.userQuestionService.submitAnswer(submission).subscribe({
      next: (response) => {
        console.log('Antwort vom Backend:', response);

        // Check for lockout (when trying to answer while already locked out)
        if (response.lockedOut) {
          this.isLockedOut = true;
          this.isAnswered = false; // Not answered, just locked out
          this.lockoutMessage = response.message;
          this.lockoutRemainingMinutes = Math.ceil((response.lockoutRemainingSeconds || 0) / 60);
          return;
        }

        // Answer was processed
        this.isAnswered = true;
        this.isCorrect = response.correct;

        // If wrong answer, show that lockout will now apply
        if (!response.correct && response.lockoutRemainingSeconds) {
          this.lockoutMessage = response.message;
          this.lockoutRemainingMinutes = Math.ceil(response.lockoutRemainingSeconds / 60);
          // Set lockout state for next attempt
          this.isLockedOut = false; // Keep false to show wrong answer message first
        }
      },
      error: (error) => {
        console.error('Fehler beim Senden der Antwort:', error);
        // Fallback: Lokale Überprüfung
        this.isAnswered = true;
        this.isCorrect = this.selectedAnswer === this.question!.correctAnswer;
      }
    });
  }

  backToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  getAnswerClass(answer: { text: string, index: number }): string[] {
    const classes = ['answer-option'];

    if (this.selectedAnswer === answer.index && !this.isAnswered) {
      classes.push('selected');
    }

    if (this.isAnswered) {
      // Nur bei richtiger Antwort die korrekte Antwort grün markieren
      if (this.isCorrect && answer.index === this.question?.correctAnswer) {
        classes.push('correct');
      }
      // Bei falscher Antwort nur die gewählte falsche Antwort rot markieren
      else if (!this.isCorrect && this.selectedAnswer === answer.index) {
        classes.push('incorrect');
      }
    }

    return classes;
  }
}
