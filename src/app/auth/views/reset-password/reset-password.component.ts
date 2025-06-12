import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPassForm: FormGroup;
  message: string;
  invalid = false;
  submitting: boolean;
  domain = window.location.host;
  url_string = window.location.href;
  url = new URL(this.url_string);
  access_token = this.url.searchParams.get("token");
  email = this.url.searchParams.get("email");
  //domain = 'vansales';
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cts: CommonToasterService,
  ) {
    this.url.searchParams.delete("token");
    this.url.searchParams.delete("email");
  }

  ngOnInit(): void {
    ////console.log(this.access_token, this.email);
    if (this.access_token == null || this.email == null) {
      this.router.navigate(['/auth/login']).then(() => {
        this.submitting = false
      });
    }
    this.resetPassForm = this.formBuilder.group({
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      token: [this.access_token],
      email: [this.email]
    });
  }

  resetPass() {
    if (this.resetPassForm.invalid) {
      return;
    }
    this.submitting = true;
    this.authService.resetPassword(this.resetPassForm.value).subscribe(res => {
      this.cts.showSuccess('Success', 'Password Reset Successfull')
      this.router.navigate(['auth/login']).then(() => {
        this.submitting = false
      });
    }, (err) => {
      ////console.log(err);
      this.submitting = false;
      let errormsg = 'Something Went Wrong!';

      // alert(errormsg)
      this.cts.showError(errormsg)

    })
  }

}
