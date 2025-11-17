import { Question } from './question';
import { User } from './user';

export interface UserQuestion {
  id?: number;
  userId: number;
  questionId: number;
  day: number;
  wrongAttempts: number;
  lastWrongAnswer?: string;
  correctAnswerDate?: string;
  // Optional fields provided by backend for convenience
  user?: User;
  question?: Question;
}
