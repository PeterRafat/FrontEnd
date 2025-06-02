import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeComponent } from './component/home/home.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';

import { AccountSettingsComponent } from './teacher/account-settings/account-settings.component';

import { QuizManuallyComponent } from './teacher/quiz-manually/quiz-manually.component';
import { RoomsComponent } from './teacher/rooms/rooms.component';
import { OpenquizComponent } from './teacher/openquiz/openquiz.component';
import { authGuard } from './guards/auth.guard';


// src/app/app.routes.ts
export const routes: Routes = [
    // Public routes
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Student routes
    {
        path: 'student',
        loadChildren: () => import('./student/student.routes').then(m => m.studentRoutes),
        canActivate: [authGuard],
        data: { role: 'student' } // Requires student role
    },

    // Teacher routes
    {
        path: 'teacher',
        loadChildren: () => import('./teacher/teacher.routes').then(m => m.teacherRoutes),
        canActivate: [authGuard],
        data: { role: 'teacher' } // Requires teacher role
    },

    // Common authenticated routes
    { path: 'home', component: HomeComponent },
    { path: 'aboutus', component: AboutusComponent, canActivate: [authGuard] },

    // Default redirects
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' }
];