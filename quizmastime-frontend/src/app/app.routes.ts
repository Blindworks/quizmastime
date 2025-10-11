import { Routes } from '@angular/router';
import { PlayerSelection } from './components/player-selection/player-selection';
import { AdventCalendar } from './components/advent-calendar/advent-calendar';

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
    path: '**',
    redirectTo: ''
  }
];
