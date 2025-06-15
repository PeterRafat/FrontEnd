import { Routes } from '@angular/router';
import { CreateStudentQuizComponent } from './student-components/create-student-quiz/create-student-quiz.component';
import { authGuard } from '../guards/auth.guard';
import { AccountSettingsComponent } from './student-components/account-settings-st/account-settings.component';
import { StudentRoomComponent } from './student-components/studentRoom/student-room.component';
import { HomeComponent } from '../component/home/home.component';
import { OpenRoomStudentComponent } from './student-components/open-room-student/open-room-student.component';
import { QuizExamStudentComponent } from './student-components/quiz-exam-student/quiz-exam-student.component';
import { QuizAiStudentComponent } from './student-components/quiz-ai-student/quiz-ai-student.component';
import { AddQuestionComponent } from './student-components/add-question/add-question.component';

export const studentRoutes: Routes = [
    {path:'',redirectTo:"home",pathMatch:'full'},
    { path: 'home', component: HomeComponent },
    { path: 'createStudentQuiz', component: CreateStudentQuizComponent },
    { path: "studentAccount", component: AccountSettingsComponent },
    { path: "studentRoom", component: StudentRoomComponent },
    { 
        path: "room/:roomId/quizzes", 
        component: OpenRoomStudentComponent,
        canActivate: [authGuard],
        data: { role: 'student' }
    },
    {
        path: 'room/:roomId/quiz/:quizId/exam',
        component: QuizExamStudentComponent,
        canActivate: [authGuard],
        data: { role: 'student' }
    },
    {
        path: 'quiz-ai-student',
        component: QuizAiStudentComponent,
        canActivate: [authGuard],
        data: { role: 'student' }
    },
    { path: 'add-question/:quizId', component: AddQuestionComponent }
];