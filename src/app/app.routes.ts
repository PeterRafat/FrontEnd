import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeComponent } from './component/home/home.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';

export const routes: Routes = [
    {path:'',redirectTo:"home",pathMatch:'full'},
    {path:"home" , component:HomeComponent},
    {path:"login" , component:LoginComponent},
    {path:"register" ,component:RegisterComponent},
    {path:"aboutus" , component:AboutusComponent},
];
