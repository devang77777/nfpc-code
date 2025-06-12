import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-invitation-form-page',
  templateUrl: './invitation-form-page.component.html',
  styleUrls: ['./invitation-form-page.component.scss']
})
export class InvitationFormPageComponent implements OnInit {
  setPasswordFormGroup: FormGroup;
  message: string;
  invalid = false;
  submitted = false;
  uuid: string;
  email: string;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    activatedRoute.queryParams.subscribe(params => {
      this.uuid = params['uuid'];
      this.email = params['email'];
    })
  }

  ngOnInit(): void {

    localStorage.clear();
    this.setPasswordFormGroup = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]],
      uuid: [this.uuid],
      email: [this.email]
    });
    this.authService.logout();
  }
  get f() { return this.setPasswordFormGroup.controls; }
  onSubmit() {
    this.apiService.setPassword(this.setPasswordFormGroup.value).subscribe(res => {
      alert('Account is created successfully.')
      this.router.navigate(['/auth/login']);
    })
  }

}
