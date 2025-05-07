import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeComponent } from './component/home/home.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';

import { AccountSettingsComponent } from './teacher/account-settings/account-settings.component';
import { StudentRoomComponent } from './student/studentRoom/student-room.component';
import { StudentQuizesComponent } from './student/studentQuizzes/student-quizes.component';

import { QuizManuallyComponent } from './teacher/quiz-manually/quiz-manually.component';
import { RoomsComponent } from './teacher/rooms/rooms.component';
import { OpenquizComponent } from './teacher/openquiz/openquiz.component';


export const routes: Routes = [
    {
        path: 'Student',
        loadChildren: () => import('./student/student.routes').then(m => m.studentRoutes)
    },
    {path:'',redirectTo:"home",pathMatch:'full'},
    {path:"home" , component:HomeComponent},
    {path:"login" , component:LoginComponent},
    {path:"register" ,component:RegisterComponent},
    {path:"aboutus" , component:AboutusComponent},

    {path:"account",component:AccountSettingsComponent},
    {path:"studentAccount",component:AccountSettingsComponent},
    {path:"studentRoom",component:StudentRoomComponent},
    { path: "studentQuizes", component: StudentQuizesComponent },


    {path:"quizManually" , component:QuizManuallyComponent},
    {path:"rooms" , component:RoomsComponent},
    {path:"openquiz" , component:OpenquizComponent},


];
