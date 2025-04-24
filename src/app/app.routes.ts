import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeComponent } from './component/home/home.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';
<<<<<<< HEAD
import { AccountSettingsComponent } from './teacher/account-settings/account-settings.component';
import { StudentRoomComponent } from './student/studentRoom/student-room.component';
import { StudentQuizesComponent } from './student/studentQuizzes/student-quizes.component';
=======
import { QuizManuallyComponent } from './teacher/quiz-manually/quiz-manually.component';
import { RoomsComponent } from './teacher/rooms/rooms.component';
import { OpenquizComponent } from './teacher/openquiz/openquiz.component';
>>>>>>> 12ed3bb7ab2311845500721367f35db03e42d886

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
<<<<<<< HEAD
    {path:"account",component:AccountSettingsComponent},
    {path:"studentAccount",component:AccountSettingsComponent},
    {path:"studentRoom",component:StudentRoomComponent},
    { path: "studentQuizes", component: StudentQuizesComponent }

=======
    {path:"quizManually" , component:QuizManuallyComponent},
    {path:"rooms" , component:RoomsComponent},
    {path:"openquiz" , component:OpenquizComponent},
>>>>>>> 12ed3bb7ab2311845500721367f35db03e42d886
];
