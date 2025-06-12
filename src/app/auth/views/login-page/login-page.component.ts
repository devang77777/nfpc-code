import { Organisation } from './../../../components/main/master/customer/customer-dt/customer-dt.component';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import {
  SocialUser,
  GoogleLoginProvider,
  SocialAuthService,
} from 'angularx-social-login';
import { setCurrency, setCurrencyDecimalFormat, setCurrencyFormat, setCurrencyDecimalFormatNew } from 'src/app/services/constants';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  user: SocialUser;
  loginForm: FormGroup;
  message: string;
  invalid = false;
  submitting: boolean;
  //domain = window.location.host;
  hidLoginForm = false;
  domain = 'merchandising';

  slider = {
    invoice: [
      { id: '0', image: '/assets/img/inv-login-1.png', text: '', active: true },
      {
        id: '1',
        image: '/assets/img/inv-login-2.png',
        text: '',
        textClass: '',
        active: false,
      },
      {
        id: '2',
        image: '/assets/img/inv-login-3.png',
        text: '',
        textClass: '',
        active: false,
      },
    ],
    merchandising: [
      {
        id: '0',
        image: '/assets/img/mar-l-1.png',
        text: 'Customer mapping',
        textClass: 'banner-text-logins',
        active: true,
      },
      {
        id: '1',
        image: '/assets/img/mar-l-2.png',
        text: 'Configure retail audit',
        textClass: 'banner-text-logins',
        active: false,
      },
      {
        id: '2',
        image: '/assets/img/mar-l-3.png',
        text: 'Visual verification',
        textClass: 'banner-text-logins',
        active: false,
      },
      {
        id: '3',
        image: '/assets/img/mar-l-4.png',
        text: 'Personalised ad',
        textClass: 'banner-text-logins',
        active: false,
      },
    ],
    nfpc: [
      {
        id: '0',
        image: '/assets/img/mar-l-1.png',
        text: 'Customer mapping',
        textClass: 'banner-text-logins',
        active: true,
      },
      {
        id: '1',
        image: '/assets/img/mar-l-2.png',
        text: 'Configure retail audit',
        textClass: 'banner-text-logins',
        active: false,
      },
      {
        id: '2',
        image: '/assets/img/mar-l-3.png',
        text: 'Visual verification',
        textClass: 'banner-text-logins',
        active: false,
      },
      {
        id: '3',
        image: '/assets/img/mar-l-4.png',
        text: 'Personalised ad',
        textClass: 'banner-text-logins',
        active: false,
      },
    ],
    presales: [
      {
        id: '0',
        image: '/assets/img/pre-ligin-1.png',
        text: 'Presale automation',
        textClass: 'banner-text-logins-pre',
        active: true,
      },
      {
        id: '1',
        image: '/assets/img/pre-ligin-2.png',
        text: 'Inventory suggestions',
        textClass: 'banner-text-logins-pre',
        active: false,
      },
      {
        id: '2',
        image: '/assets/img/pre-ligin-3.png',
        text: 'Loyalty management',
        textClass: 'banner-text-logins-pre',
        active: false,
      },
      {
        id: '3',
        image: '/assets/img/pre-ligin-4.png',
        text: 'Mobile app',
        textClass: 'banner-text-logins-pre',
        active: false,
      },
    ],
  };

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    center: true,
    dots: true,
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
  };
  forgotForm: FormGroup;
  forgotView = false;
  showEmailMsg = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private socService: SocialAuthService,
    private msService: MsalService
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('isLoggedIn') == "true" && this.domain !== 'presales-prodmobiato.nfpc.net') {
      this.router.navigate(['/dashboard/board1']);
    } else {
      this.router.navigate(['/dashboard/monthly-kpi']);
    }
    localStorage.clear();
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: ['system'],
    });
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.socService.authState.subscribe((user) => {
      this.user = user;
      //// console.log(this.user);
    });
    this.msService.instance.handleRedirectPromise().then(res => {
      if (res !== null && res.account !== null) {
        this.msService.instance.setActiveAccount(res.account);
      }
    });
    this.authService.logout();
  }
  get f() {
    return this.loginForm.controls;
  }

  signInWithGoogle(): void {
    this.socService.signIn(GoogleLoginProvider.PROVIDER_ID).then((x) => {
      this.loginForm.patchValue({
        email: x.email,
        password: '',
        type: 'google',
      });
      this.onSubmit();
    });
  }
  signInWithAD(): void {
    // this.msService.loginRedirect();
    this.msService.loginPopup().subscribe((response: AuthenticationResult) => {
      this.msService.instance.setActiveAccount(response.account);
      this.loginWithAD(response.account?.username);
    });
  }

  loginWithAD(emailId) {
    const model = { email: emailId };
    this.authService.loginWithAD(model).subscribe(
      (res) => {
        if (res.status === true) {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('organisationGeneralRangeuuId', res.data.org_setting?.uuid);
          localStorage.setItem('roleName', res?.data?.user_info?.role?.name);
          this.apiService.forkLoginData().subscribe((res) => {
            const [theme, setting] = res;
            localStorage.setItem(
              'currency',
              JSON.stringify(setting.data.currency)
            );
            setCurrency(setting.data.currency?.code);
            setCurrencyDecimalFormat("." + setting.data.currency?.decimal_digits);
            setCurrencyDecimalFormatNew(setting.data.currency?.decimal_digits);
            setCurrencyFormat(setting.data.currency?.format);
            const selectedThem = theme['data'].find(
              (x) => x.id == setting.data.theme
            );
            const themeName = selectedThem
              ? this.makeName(selectedThem.name)
              : 'default';
            localStorage.setItem('selected-theme', themeName);
            document.documentElement.setAttribute('data-theme', themeName);
            localStorage.setItem(
              'avatar_img',
              JSON.stringify(
                setting.data.user_info?.organisation_trim?.org_logo
              )
            );
            this.hidLoginForm = true;
            localStorage.setItem(
              'permissions',
              JSON.stringify(setting.data['permissions-name'])
            );
            localStorage.setItem('firstname', setting.data.loggedin_user.firstname);
            localStorage.setItem('lastname', setting.data.loggedin_user.lastname);
            localStorage.setItem('email', setting.data.loggedin_user.email);
            localStorage.setItem('id', setting.data.loggedin_user.id);
            localStorage.setItem(
              'org_name',
              setting.data.user_info?.organisation_trim?.org_name
            );
            localStorage.setItem('roleId', setting.data.loggedin_user.role_id);
            localStorage.setItem('userType', setting.data.loggedin_user.usertype);

            localStorage.setItem(
              'sidebar',
              JSON.stringify({
                sidebar: setting.data.sidebar,
                setting: setting.data.setting,
              })
            );
            localStorage.setItem(
              'login_track_activity',
              JSON.stringify(setting.data.login_track_activity)
            );
            localStorage.setItem(
              'allSoftware',
              JSON.stringify(setting.data.allSoftware)
            );
            localStorage.setItem('isLoggedIn', 'true');
            if (this.domain !== 'presales-prodmobiato.nfpc.net') {
              this.router.navigate(['/dashboard/board1']).then(() => {
                this.submitting = false;
              });
            } else {
              this.router.navigate(['/dashboard/monthly-kpi']).then(() => {
                this.submitting = false;
              });
            }
          });
        }
      },
      (err) => {

        // console.log(err);

        // alert(err.error.message)
      }
    );
  }
  onSubmit() {
    this.submitting = true;
    this.authService.login(this.loginForm.value).subscribe(
      (res) => {
        if (res.status === true) {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('organisationGeneralRangeuuId', res.data.org_setting?.uuid);
          localStorage.setItem('roleName', res?.data?.user_info?.role?.name);
          this.apiService.forkLoginData().subscribe((res) => {
            const [theme, setting] = res;
            localStorage.setItem(
              'currency',
              JSON.stringify(setting.data.currency)
            );
            setCurrency(setting.data.currency?.code);
            setCurrencyDecimalFormat("." + setting.data.currency?.decimal_digits);
            setCurrencyDecimalFormatNew(setting.data.currency?.decimal_digits);
            setCurrencyFormat(setting.data.currency?.format);
            const selectedThem = theme['data'].find(
              (x) => x.id == setting.data.theme
            );
            let themeName = selectedThem
              ? this.makeName(selectedThem.name)
              : 'default';
            localStorage.setItem('selected-theme', themeName);
            document.documentElement.setAttribute('data-theme', themeName);
            localStorage.setItem(
              'avatar_img',
              JSON.stringify(
                setting.data.user_info?.organisation_trim?.org_logo
              )
            );
            this.hidLoginForm = true;
            localStorage.setItem(
              'permissions',
              JSON.stringify(setting.data['permissions-name'])
            );
            localStorage.setItem('firstname', setting.data.loggedin_user.firstname);
            localStorage.setItem('lastname', setting.data.loggedin_user.lastname);
            localStorage.setItem('email', setting.data.loggedin_user.email);
            localStorage.setItem('id', setting.data.loggedin_user.id);
            localStorage.setItem(
              'org_name',
              setting.data.user_info?.organisation_trim?.org_name
            );
            localStorage.setItem('roleId', setting.data.loggedin_user.role_id);
            localStorage.setItem('userType', setting.data.loggedin_user.usertype);

            localStorage.setItem(
              'sidebar',
              JSON.stringify({
                sidebar: setting.data.sidebar,
                setting: setting.data.setting,
              })
            );
            localStorage.setItem(
              'login_track_activity',
              JSON.stringify(setting.data.login_track_activity)
            );
            localStorage.setItem(
              'allSoftware',
              JSON.stringify(setting.data.allSoftware)
            );
            localStorage.setItem('isLoggedIn', 'true');
            if (this.domain !== 'presales-prodmobiato.nfpc.net') {
              this.router.navigate(['/dashboard/board1']).then(() => {
                this.submitting = false;
              });
            } else {
              this.router.navigate(['/dashboard/monthly-kpi']).then(() => {
                this.submitting = false;
              });
            }
          });
        } else {
          if (this.loginForm.value.type == 'system') {
            this.message = 'Please check your Username/Email and password';
          } else {
            localStorage.setItem('google_user_data', JSON.stringify(this.user));
            this.router.navigate(['/auth/signup']);
            this.message = 'No account found with this email';
          }

          this.invalid = true;
        }
      },
      (err) => {
        if (this.loginForm.value.type == 'system') {
          this.message = 'Please check your Username/Email and password';
        } else {
          localStorage.setItem('google_user_data', JSON.stringify(this.user));
          this.router.navigate(['/auth/signup']);
          this.message = 'No account found with this email';
        }
        this.invalid = true;
        this.submitting = false;
        //console.log(err);

        // alert(err.error.message)
      }
    );
  }
  makeName(name) {
    let updated = name.replace(/ /g, '');
    updated = updated.charAt(0).toLowerCase() + updated.slice(1);
    return updated;
  }

  showForgotPassForm() {
    this.forgotView = this.forgotView == true ? false : true;
  }

  onForgotSubmit() {
    this.submitting = true;
    this.authService.forgotPassword(this.forgotForm.value).subscribe(
      (res) => {
        this.submitting = false;
        if (res.status == true) {
          this.showForgotPassForm();
          this.showEmailMsg = true;
          this.message = "Please check your Email to Rest your password!";
          setTimeout(() => {
            this.showEmailMsg = false;
          }, 10000);
        } else {
          this.invalid = true;
          this.message = "Incorrect Email!";
        }
      },
      (error) => {
        this.submitting = false;
        this.invalid = true;
        this.message = "Incorrect Email!";
      });
  }
}
