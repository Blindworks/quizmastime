export interface Player {
  id?: number;
  name: string;
  correctAnswers: number;
  totalAnswers: number;
  lastPlayedDate?: Date;
}
