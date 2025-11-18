import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuestionService } from '../../services/question';
import { UserQuestionService, UserQuestion } from '../../services/user-question.service';
import { Question } from '../../models/question';
import { User } from '../../models/user';
import { AnswerSubmission } from '../../models/answer-submission';
import { CongratulationsDialog } from '../congratulations-dialog/congratulations-dialog';

@Component({
  selector: 'app-question-view',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
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
  hasImageError: boolean = false;
  hasBackImageError: boolean = false;

  constructor(
    private questionService: QuestionService,
    private userQuestionService: UserQuestionService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
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

    // Load UserQuestion assignment for this day first
    this.userQuestionService.getUserQuestionsByUserIdAndDay(this.currentUser!.id!, this.day).subscribe({
      next: (userQuestions) => {
        if (userQuestions && userQuestions.length > 0 && userQuestions[0].question) {
          // Use the question from the UserQuestion assignment
          const userQuestion = userQuestions[0];
          this.question = {
            id: userQuestion.question!.id,
            questionText: userQuestion.question!.questionText,
            answer1: userQuestion.question!.answer1,
            answer2: userQuestion.question!.answer2,
            answer3: userQuestion.question!.answer3,
            correctAnswer: userQuestion.question!.correctAnswer
          };
          this.prepareAnswers();
          // Check lockout status after question is loaded
          this.checkLockoutStatus();
          this.loading = false;
        } else {
          // Fallback: No UserQuestion assigned for this day, load all questions
          console.warn('Keine UserQuestion-Zuweisung für Tag gefunden:', this.day);
          this.loadQuestionFallback();
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der UserQuestion:', error);
        // Fallback to old behavior
        this.loadQuestionFallback();
      }
    });
  }

  loadQuestionFallback(): void {
    // Fallback: Load all questions and use array index (old behavior)
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

          // If this is question 24 and it's already answered correctly,
          // check if all questions are answered to show the prize popup
          if (this.day === 24) {
            this.checkAndShowPrizePopup();
          }
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

        // Check if this is question 24 and was answered correctly
        if (this.day === 24 && response.correct) {
          // Check if all questions have been answered correctly
          this.checkAndShowPrizePopup();
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

  getDayIconPath(): string {
    return `/assets/icons/day-${this.day}.png`;
  }

  getAvatarUrl(user: User): string {
    const firstName = user.firstName.toLowerCase();
    const lastName = user.lastName.toLowerCase();
    return `/assets/images/players/${firstName}_${lastName}.png`;
  }

  onImageError(): void {
    this.hasImageError = true;
  }

  onBackImageError(): void {
    this.hasBackImageError = true;
  }

  checkAndShowPrizePopup(): void {
    if (!this.currentUser || !this.currentUser.id) {
      console.log('Kein User gefunden für Prize-Popup-Check');
      return;
    }

    console.log('Prüfe, ob alle Fragen beantwortet wurden für Prize-Popup...');

    // Load all user questions to check if all are answered correctly
    this.userQuestionService.getUserQuestionsByUserId(this.currentUser.id).subscribe({
      next: (userQuestions) => {
        console.log(`Gefundene UserQuestions: ${userQuestions.length}`);

        // Filter questions for days 1-24
        const relevantQuestions = userQuestions.filter(uq => uq.day >= 1 && uq.day <= 24);
        console.log(`Relevante Fragen (Tag 1-24): ${relevantQuestions.length}`);

        // Check if all 24 questions have been answered correctly
        if (relevantQuestions.length === 24) {
          const correctAnswers = relevantQuestions.filter(uq => uq.correctAnswerDate != null);
          console.log(`Korrekt beantwortete Fragen: ${correctAnswers.length} von 24`);

          const allCorrect = relevantQuestions.every(uq => uq.correctAnswerDate != null);

          if (allCorrect) {
            console.log('Alle 24 Fragen korrekt beantwortet! Zeige Glückwunsch-Popup.');
            // Show congratulations popup automatically
            this.showCongratulationsDialog();
          } else {
            console.log('Noch nicht alle Fragen korrekt beantwortet.');
          }
        } else {
          console.log(`Noch nicht alle 24 Fragen zugewiesen (aktuell: ${relevantQuestions.length})`);
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der UserQuestions:', error);
      }
    });
  }

  showCongratulationsDialog(): void {
    const dialogRef = this.dialog.open(CongratulationsDialog, {
      width: '600px',
      disableClose: false,
      panelClass: 'congratulations-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'view-prize') {
        this.router.navigate(['/prize']);
      }
    });
  }
}
