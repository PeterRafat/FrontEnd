import { Routes } from '@angular/router';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { QuizManuallyComponent } from './quiz-manually/quiz-manually.component';
import { RoomsComponent } from './rooms/rooms.component';
import { OpenquizComponent } from './openquiz/openquiz.component';
import { AddEditQuestionComponent } from './add-edit-question/add-edit-question.component';
import { TestQuizComponent } from './test-quiz/test-quiz.component';
import { authGuard } from '../guards/auth.guard';
import { HomeComponent } from '../component/home/home.component';

export const teacherRoutes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: "home", pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: "account", component: AccountSettingsComponent },
            { path: "quizManually/:roomId", component: QuizManuallyComponent },
            { path: "quiz-ai/:roomId", loadComponent: () => import('./quiz-ai/quiz-ai.component').then(m => m.QuizAiComponent) },
            { path: "rooms", component: RoomsComponent },
            { path: "openquiz/:roomId", component: OpenquizComponent },
            { path: "edit-questions/:roomId/:quizId", component: AddEditQuestionComponent },
            { path: "test-quiz/:roomId/:quizId", component: TestQuizComponent },
            { path: "quiz-test-ai-teacher/:roomId/:quizId", loadComponent: () => import('./quiz-test-ai-teacher/quiz-test-ai-teacher.component').then(m => m.QuizTestAiTeacherComponent) }
        ]
    }
];
