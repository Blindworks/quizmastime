import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { QuestionService } from '../../services/question';
import { Question } from '../../models/question';

@Component({
  selector: 'app-question-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './question-list.html',
  styleUrl: './question-list.scss'
})
export class QuestionList implements OnInit {
  questions: Question[] = [];
  displayedColumns: string[] = ['questionText', 'answer1', 'answer2', 'answer3', 'correctAnswer', 'actions'];
  @Output() editQuestion = new EventEmitter<Question>();

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.questionService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      }
    });
  }

  deleteQuestion(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this question?')) {
      this.questionService.deleteQuestion(id).subscribe({
        next: () => {
          this.loadQuestions();
        },
        error: (error) => {
          console.error('Error deleting question:', error);
        }
      });
    }
  }

  onEditQuestion(question: Question): void {
    this.editQuestion.emit(question);
  }

  getCorrectAnswerText(question: Question): string {
    switch(question.correctAnswer) {
      case 1: return question.answer1;
      case 2: return question.answer2;
      case 3: return question.answer3;
      default: return '';
    }
  }
}
