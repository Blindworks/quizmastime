export interface AnswerResponse {
  correct: boolean;
  correctAnswer: number;
  userQuestion: any; // UserQuestion DTO
  message: string;
}
