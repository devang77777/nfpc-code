import { AuthGuard } from 'src/app/guards/auth.guard';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupPageComponent } from './views/signup-page/signup-page.component';
import { LoginPageComponent } from './views/login-page/login-page.component';


const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "login",
  },
  {
    path: "login",
    component: LoginPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "signup",
    component: SignupPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
    canActivate: [AuthGuard]
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
