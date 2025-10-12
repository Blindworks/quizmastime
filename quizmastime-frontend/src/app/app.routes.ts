import { Routes } from '@angular/router';
import { PlayerSelection } from './components/player-selection/player-selection';
import { AdventCalendar } from './components/advent-calendar/advent-calendar';
import { Admin } from './components/admin/admin';
import { QuestionView } from './components/question-view/question-view';

export const routes: Routes = [
  {
    path: '',
    component: PlayerSelection
  },
  {
    path: 'calendar',
    component: AdventCalendar
  },
  {
    path: 'question/:day',
    component: QuestionView
  },
  {
    path: 'admin',
    component: Admin
  },
  {
    path: '**',
    redirectTo: ''
  }
];
