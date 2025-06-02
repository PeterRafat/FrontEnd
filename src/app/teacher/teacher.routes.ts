import { Routes } from '@angular/router';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { QuizManuallyComponent } from './quiz-manually/quiz-manually.component';
import { RoomsComponent } from './rooms/rooms.component';
import { OpenquizComponent } from './openquiz/openquiz.component';
import { authGuard } from '../guards/auth.guard';
import { HomeComponent } from '../component/home/home.component';

export const teacherRoutes: Routes = [
    {path:'',redirectTo:"home",pathMatch:'full'},
    { path: 'home', component: HomeComponent },
    { path: "account", component: AccountSettingsComponent },
    { path: "quizManually", component: QuizManuallyComponent },
    { path: "rooms", component: RoomsComponent },
    { path: "openquiz", component: OpenquizComponent },
];
