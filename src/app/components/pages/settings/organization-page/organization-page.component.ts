import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BaseComponent } from '../../../../features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { setCurrency, setCurrencyDecimalFormat, setCurrencyFormat, setCurrencyDecimalFormatNew } from 'src/app/services/constants';
@Component({
  selector: 'app-organization-page',
  templateUrl: './organization-page.component.html',
  styleUrls: ['./organization-page.component.scss'],
})
export class OrganizationPageComponent extends BaseComponent implements OnInit {
  isLoggedIn: boolean = false;
  organisationFormGroup: FormGroup;
  countries;
  country;
  submitting: boolean;
  public imageSrc: string = '';
  choosenFileName = 'Choose file';
  fiscalYears = [
    { id: 1, fyear: 'January - Decemeber' },
    { id: 2, fyear: 'February - January' },
    { id: 3, fyear: 'March - February' },
    { id: 4, fyear: 'April - March' },
    { id: 5, fyear: 'May - April' },
    { id: 6, fyear: 'June - May' },
    { id: 7, fyear: 'July - June' },
    { id: 8, fyear: 'August - July' },
    { id: 9, fyear: 'September - August' },
    { id: 10, fyear: 'October - September' },
    { id: 11, fyear: 'November - October' },
    { id: 12, fyear: 'December - November' },
  ];
  public id: string;
  private uuid: string;
  public firstname: string;
  public lastname: string;
  public email: string;
  public accessToken: string;
  url_string = window.location.href;
  url = new URL(this.url_string);
  access_token = this.url.searchParams.get("token");
  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cts: CommonToasterService,
  ) {
    super('Organization');
    this.url.searchParams.delete("token");
  }

  ngOnInit(): void {
    this.organisationFormGroup = this.formBuilder.group({
      org_company_id: [''],
      org_name: ['', Validators.required],
      org_street1: ['', Validators.required],
      org_street2: [''],
      org_city: ['', Validators.required],
      org_state: ['', Validators.required],
      org_country_id: ['', Validators.required],
      org_postal: ['', Validators.required],
      org_phone: [''],
      org_contact_person: ['', Validators.required],
      org_contact_person_number: [''],
      org_currency: ['', Validators.required],
      org_fasical_year: [''],
      org_tax_id: [''],
      org_logo: [''],
      org_status: ['1'],
      gstin_number: [],
      gst_reg_date: [],
    });
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.isLoggedIn = true;
      this.apiService.getOrganizaion().subscribe((res) => {
        this.id = res.data.id;
        this.apiService.getUser().subscribe((res) => {
          this.firstname = res.data.firstname;
          this.lastname = res.data.lastname;
          this.email = res.data.email;
        });
        // this.firstname =res.data.firstname;
        // this.lastname = res.data.lastname;
        // this.email =res.data.email;
        this.uuid = res.data.uuid;
        this.organisationFormGroup.patchValue({
          org_company_id: res.data.org_company_id,
        });
        this.organisationFormGroup.patchValue({ org_name: res.data.org_name });
        this.organisationFormGroup.patchValue({
          org_street1: res.data.org_street1,
        });
        this.organisationFormGroup.patchValue({
          org_street2: res.data.org_street2,
        });
        this.organisationFormGroup.patchValue({ org_city: res.data.org_city });
        this.organisationFormGroup.patchValue({
          org_state: res.data.org_state,
        });
        this.organisationFormGroup.patchValue({
          org_country_id: res.data.org_country_id,
        });
        this.organisationFormGroup.patchValue({
          org_postal: res.data.org_postal,
        });
        this.organisationFormGroup.patchValue({
          org_phone: res.data.org_phone,
        });
        this.organisationFormGroup.patchValue({
          org_contact_person: res.data.org_contact_person,
        });
        this.organisationFormGroup.patchValue({
          org_contact_person_number: res.data.org_contact_person_number,
        });
        this.organisationFormGroup.patchValue({
          org_currency: res.data.org_currency,
        });
        this.organisationFormGroup.patchValue({
          org_fasical_year: res.data.org_fasical_year,
        });
        this.organisationFormGroup.patchValue({
          org_tax_id: res.data.org_tax_id,
        });
        this.organisationFormGroup.patchValue({ org_logo: res.data.org_logo });
      });
      this.afterVerifyCheck();
    } else {
      if (this.access_token !== null) {
        this.submitting = true;
        this.apiService.verfiyToken(this.access_token).subscribe((res) => {
          sessionStorage.setItem("country_id", res.data.user_info.country_id);
          sessionStorage.setItem("email", res.data.user_info.email);
          sessionStorage.setItem("firstname", res.data.user_info.firstname);
          sessionStorage.setItem("lastname", res.data.user_info.lastname);
          sessionStorage.setItem("mobile", res.data.user_info.mobile);
          localStorage.setItem("token", res.data.accessToken);
          sessionStorage.setItem("uuid", res.data.user_info.uuid);
          sessionStorage.setItem("password", ''),
            sessionStorage.setItem('login_type', 'google');
          this.submitting = false;
          this.afterVerifyCheck();
        },
          (error) => {
            this.router.navigate(['/auth/login']);
          })
      } else {
        this.router.navigate(['/auth/login']);
      }
    }
    //console.log(this.organisationFormGroup);
  }

  afterVerifyCheck() {
    this.apiService.getAllCountries().subscribe((res) => {
      this.countries = res.data;
      //console.log(this.countries);
      this.country = this.countries.filter((obj) => {
        return obj.id == sessionStorage.getItem('country_id');
      });
      //console.log(this.country);
      if (!this.isLoggedIn) {
        this.organisationFormGroup.patchValue({
          org_currency: this.country[0]?.currency_code,
        });
      }
    });
    // this.signupService.orgData.subscribe((res:any) =>{
    //   this.orgData = res.data;
    //   //console.log("res",res);
    //   //console.log("orgData: ", this.orgData);
    //   this.organisationFormGroup.patchValue({org_phone: res.data.mobile});
    //   this.organisationFormGroup.patchValue({org_country_id: res.data.country_id});
    // })

    this.organisationFormGroup.patchValue({
      org_phone: sessionStorage.getItem('mobile') == "null" ? '' : sessionStorage.getItem('mobile'),
    });
    this.organisationFormGroup.patchValue({
      org_country_id: sessionStorage.getItem('country_id'),
    });

    this.firstname = sessionStorage.getItem('firstname');
    this.lastname = sessionStorage.getItem('lastname');
    this.id = sessionStorage.getItem('id');
    this.email = sessionStorage.getItem('email');
    this.accessToken = sessionStorage.getItem('accessToken');
  }

  handleInputChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    //console.log('org file', file);
    if (file !== undefined) {
      this.choosenFileName = file.name;
      //console.log(this.choosenFileName);
    } else {
      this.choosenFileName = "Choose File";
    }

    var pattern = /image-*/;
    var reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }
  _handleReaderLoaded(e) {
    let reader = e.target;
    this.imageSrc = reader.result;
    this.organisationFormGroup.get('org_logo').setValue(this.imageSrc);
    //console.log('org logo', this.organisationFormGroup);
  }
  removeImg() {
    this.orgLogoFormControl.reset();
  }
  public get orgLogoFormControl() {
    return this.organisationFormGroup.get('org_logo');
  }
  public get orgIdFormControl() {
    return this.organisationFormGroup.get('org_company_id');
  }
  public get orgNameFormControl() {
    return this.organisationFormGroup.get('org_name');
  }
  public get street1FormControl() {
    return this.organisationFormGroup.get('org_street1');
  }
  public get cityFormControl() {
    return this.organisationFormGroup.get('org_city');
  }
  public get stateFormControl() {
    return this.organisationFormGroup.get('org_state');
  }
  public get countryFormControl() {
    return this.organisationFormGroup.get('org_country_id');
  }
  public get postalFormControl() {
    return this.organisationFormGroup.get('org_postal');
  }
  public get phoneFormControl() {
    return this.organisationFormGroup.get('org_phone');
  }
  public get contactPersonFormControl() {
    return this.organisationFormGroup.get('org_contact_person');
  }
  public get contactPersonPhoneFormControl() {
    return this.organisationFormGroup.get('org_contact_person_number');
  }
  public get CurrencyFormControl() {
    return this.organisationFormGroup.get('org_currency');
  }

  onSubmit() {
    if (this.isLoggedIn) {
      //console.log('org logo', this.organisationFormGroup);
      let reqData = this.organisationFormGroup.value;
      reqData.org_logo = this.imageSrc;
      this.apiService
        .updateOrganisation(this.uuid, reqData)
        .subscribe((res) => {
          if (res.status == true) {
            localStorage.setItem('avatar_img', JSON.stringify(res.data.org_logo));
            this.cts.showSuccess('Success', 'Updated Successfully!');
          } else {
            this.cts.showError('Error', res.message);
          }


        });
    } else {
      this.submitting = true;
      this.orgIdFormControl.markAsDirty;
      this.orgNameFormControl.markAsDirty;
      this.street1FormControl.markAsDirty;
      this.cityFormControl.markAsDirty;
      this.stateFormControl.markAsDirty;
      this.countryFormControl.markAsDirty;
      this.postalFormControl.markAsDirty;
      this.phoneFormControl.markAsDirty;
      this.contactPersonFormControl.markAsDirty;
      this.CurrencyFormControl.markAsDirty;
      let reqData = this.organisationFormGroup.value;
      reqData.org_logo = this.imageSrc;
      this.apiService
        .addOrganisation(reqData, this.accessToken)
        .subscribe((res) => {
          this.apiService.LoginTrack().subscribe();
          // this.submitting = false;
          // this.authService
          //   .login({
          //     email: this.email,
          //     password: sessionStorage.getItem('password') == "undefined" ? '' : sessionStorage.getItem('password'),
          //     type: sessionStorage.getItem('login_type')
          //   })
          //   .subscribe((res) => {
          //     if (res.status === true) {
          // localStorage.setItem('token', res.data.accessToken);

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
            this.router.navigate(['/dashboard']);
          });
          // }
          //   });
          // //console.log(res);
          // sessionStorage.clear();
        });
    }

    // this.router.navigate(['/dashboard']).then(() => {
    //   window.location.reload();
    // });
  }

  makeName(name) {
    let updated = name.replace(/ /g, '');
    updated = updated.charAt(0).toLowerCase() + updated.slice(1);
    return updated;
  }
}
