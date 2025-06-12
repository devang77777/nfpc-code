import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { SignupPageComponent } from './views/signup-page/signup-page.component';
import { SharedModule } from '../features/shared/shared.module';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { MaterialImportModule } from '../imports/material-import/material-import.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { GoogleLoginProvider, SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
@NgModule({
  declarations: [LoginPageComponent, SignupPageComponent, ResetPasswordComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,

    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    SocialLoginModule,
    CarouselModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '1014417899760-vgvs8fslklbd678gqqktpd85autfcdr3.apps.googleusercontent.com'
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    }
  ],
})
export class AuthModule { }
