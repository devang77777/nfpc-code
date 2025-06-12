import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OwlOptions } from "ngx-owl-carousel-o";
import { SocialUser, GoogleLoginProvider, SocialAuthService } from "angularx-social-login";
import { setCurrency, setCurrencyDecimalFormat, setCurrencyFormat, setCurrencyDecimalFormatNew } from 'src/app/services/constants';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements OnInit {
  user: SocialUser;
  signupForm: FormGroup;
  message: string;
  countries: any[];
  invalid = false;
  submitting: boolean;
  disabledAgreement: boolean = false;
  domain = window.location.host;
  hidePasswords = false;
  //domain = 'vansales';

  slider = {
    'invoice': [
      { id: '0', image: '/assets/img/inv-login-1.png', text: '', active: true },
      { id: '1', image: '/assets/img/inv-login-2.png', text: '', textClass: '', active: false },
      { id: '2', image: '/assets/img/inv-login-3.png', text: '', textClass: '', active: false },
    ],
    'merchandising': [
      { id: '0', image: '/assets/img/mar-l-1.png', text: 'Customer mapping', textClass: 'banner-text-logins', active: true },
      { id: '1', image: '/assets/img/mar-l-2.png', text: 'Configure retail audit', textClass: 'banner-text-logins', active: false },
      { id: '2', image: '/assets/img/mar-l-3.png', text: 'Visual verification', textClass: 'banner-text-logins', active: false },
      { id: '3', image: '/assets/img/mar-l-4.png', text: 'Personalised ad', textClass: 'banner-text-logins', active: false },
    ],
    'presales-prodmobiato.nfpc.net': [
      { id: '0', image: '/assets/img/mar-l-1.png', text: 'Customer mapping', textClass: 'banner-text-logins', active: true },
      { id: '1', image: '/assets/img/mar-l-2.png', text: 'Configure retail audit', textClass: 'banner-text-logins', active: false },
      { id: '2', image: '/assets/img/mar-l-3.png', text: 'Visual verification', textClass: 'banner-text-logins', active: false },
      { id: '3', image: '/assets/img/mar-l-4.png', text: 'Personalised ad', textClass: 'banner-text-logins', active: false },
    ],
    'presales': [
      { id: '0', image: '/assets/img/pre-ligin-1.png', text: 'Presale automation', textClass: 'banner-text-logins-pre', active: true },
      { id: '1', image: '/assets/img/pre-ligin-2.png', text: 'Inventory suggestions', textClass: 'banner-text-logins-pre', active: false },
      { id: '2', image: '/assets/img/pre-ligin-3.png', text: 'Loyalty management', textClass: 'banner-text-logins-pre', active: false },
      { id: '3', image: '/assets/img/pre-ligin-4.png', text: 'Mobile app', textClass: 'banner-text-logins-pre', active: false },
    ]
  }

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    center: true,
    dots: true,
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 1
      },
      1000: {
        items: 1
      }
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private cts: CommonToasterService,
    private socService: SocialAuthService,
    private msService: MsalService
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('isLoggedIn') == "true") {
      this.router.navigate(['/dashboard']);
    }
    ////console.log('ininit');
    // localStorage.setItem('isLoggedIn', 'false');
    // localStorage.removeItem('token');
    let google_user_data = JSON.parse(localStorage.getItem('google_user_data'));
    this.signupForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      country_id: ['', Validators.required],
      login_type: ['system']
    });
    if (google_user_data !== null) {
      this.googleSinginHandler(google_user_data);
      localStorage.removeItem('google_user_data');
    } else {
      setTimeout(() => {
        this.signupForm.controls['mobile'].setErrors({ required: true });
      }, 1000);
    }
    this.getAllCountries();

    this.socService.authState.subscribe((user) => {
      this.user = user;
      if (user) {
        this.signupForm.controls['mobile'].setErrors(null);
        ////console.log(this.signupForm);
      }
      //console.log(this.user);
    });
  }
  getAllCountries() {
    this.apiService.getAllCountries().subscribe((data: any) => {
      this.countries = data.data;

    })
  }

  signInWithGoogle(): void {
    this.socService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then(x => {
        this.googleSinginHandler(x);
      });
  }
  signInWithAD(): void {
    this.msService.loginPopup().subscribe((response: AuthenticationResult) => {
      this.msService.instance.setActiveAccount(response.account);
      this.googleSinginHandler(response);
    });
  }
  googleSinginHandler(x) {
    //console.log('setgoogle');
    let loginform = {
      email: x.email,
      password: '',
      type: 'google'
    };


    this.authService.login(loginform).subscribe(
      (res) => {
        if (res.status === true) {
          this.submitting = true;
          localStorage.setItem('token', res.data.accessToken);
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
            this.router.navigate(['/dashboard']).then(() => {
              this.submitting = false;
            });
          });
        } else {
          this.submitting = false;
          this.googleFOrmHandler(x);
        }
      },
      (err) => {
        this.submitting = false;
        this.googleFOrmHandler(x);
        // alert(err.error.message)
      }
    );
  }

  makeName(name) {
    let updated = name.replace(/ /g, '');
    updated = updated.charAt(0).toLowerCase() + updated.slice(1);
    return updated;
  }

  googleFOrmHandler(x) {
    this.signupForm.patchValue({
      firstname: x.firstName,
      lastname: x.lastName,
      email: x.email,
      mobile: '',
      password: '',
      password_confirmation: '',
      login_type: 'google'
    });
    this.hidePasswords = true;
    this.signupForm.controls['password'].disable();
    this.signupForm.controls['password_confirmation'].disable();
    this.signupForm.controls['mobile'].setErrors(null);
  }

  signup() {
    // if (this.signupForm.invalid) {
    //   return;
    // }
    this.submitting = true;
    if (localStorage.getItem("token")) {
      localStorage.clear();
    }
    const form = this.signupForm.value;
    if (form.country_id && form.country_id.length > 0) {
      form.country_id = form.country_id[0].id
    }
    this.apiService.signup(JSON.stringify(form)).subscribe(res => {
      // this.signupService.setOrgData(res);   
      //console.log(sessionStorage);
      // if (this.signupForm.value.login_type == 'system') {
      this.router.navigate(['auth/login']).then(() => {
        this.submitting = false
      });
      // } else {
      //   sessionStorage.setItem("country_id", res.data.user_info.country_id);
      //   sessionStorage.setItem("email", res.data.user_info.email);
      //   sessionStorage.setItem("firstname", res.data.user_info.firstname);
      //   sessionStorage.setItem("lastname", res.data.user_info.lastname);
      //   sessionStorage.setItem("mobile", res.data.user_info.mobile);
      //   localStorage.setItem("token", res.data.accessToken);
      //   sessionStorage.setItem("uuid", res.data.user_info.uuid);
      //   sessionStorage.setItem("password", this.signupForm.value.password),
      //     sessionStorage.setItem('login_type', this.signupForm.value.login_type);
      //   this.router.navigate(['settings/organization']).then(() => {
      //     this.submitting = false
      //   });
      // }

    }, (err) => {
      //console.log(err);
      this.submitting = false;
      let errormsg: string;
      if (err.error.errors) {
        if (err.error.errors.email) {
          errormsg = `${err.error.message}. ${err.error?.errors?.email[0]}`;
        }
        else if (err.error.errors.password) {
          errormsg = `${err.error.message}. ${err.error?.errors?.password[0]}`;
        }
      }
      // alert(errormsg)
      this.cts.showError(errormsg)

    })
  }
}
