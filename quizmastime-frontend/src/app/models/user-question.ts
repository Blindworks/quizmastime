export interface UserQuestion {
  id?: number;
  userId: number;
  questionId: number;
  day: number;
  wrongAttempts: number;
  lastWrongAnswer?: string;
  correctAnswerDate?: string;
}
