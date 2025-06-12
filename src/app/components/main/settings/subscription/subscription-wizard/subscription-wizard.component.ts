import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../settings.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-subscription-wizard',
  templateUrl: './subscription-wizard.component.html',
  styleUrls: ['./subscription-wizard.component.scss']
})
export class SubscriptionWizardComponent implements OnInit {
  public selectedIndex = 0;
  public domain = window.location.host;

  public Plans = [];
  public selectedPlan: any;
  public selectedPlanId = 0;
  public BillingFromGroup;
  public enableNext = true;
  countries = [];
  public subscriptions: Subscription[] = [];
  months = [];
  years = [];
  viewMore = 0;
  constructor(public ss: SettingsService, public fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.BillingFromGroup = this.fb.group({
      frequency: ['yearly'],
      totalPrice: [0.00],
      companyName: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      country: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      cardNumber: ['', [Validators.required]],
      cardExpMonth: ['', [Validators.required]],
      cardExpYear: ['', [Validators.required]],
      cardCvv: ['', [Validators.required]],
      sameAddress: [false],
      cardCountry: ['', [Validators.required]],
      cardAddress: ['', [Validators.required]],
      cardCity: ['', [Validators.required]],
      cardState: ['', [Validators.required]],
      cardZipCode: ['', [Validators.required]],
    })
    if (this.domain.split(':')[0] == 'localhost' || this.domain.split('.')[0] == "mobiato-msfa") {
      this.domain = 'presales';
    } else {
      this.domain = this.domain.split('.')[0];
    }
    this.subscriptions.push(
      this.ss.getFeaturePlans(this.domain).subscribe(
        (res) => {
          this.Plans = res.data.plan;
        }
      )
    )
    this.subscriptions.push(
      this.apiService.getAllCountries().subscribe((data: any) => {
        this.countries = data.data;

      })
    )

    let d = new Date();
    let currentYear = d.getFullYear();
    let futureDate = new Date(d.setFullYear(d.getFullYear() + 20));
    let futureYear = futureDate.getFullYear();
    for (let index = currentYear; index < futureYear; index++) {
      this.years.push(index);
    }
    for (let index = 1; index <= 12; index++) {
      this.months.push(index);
    }
    //console.log(this.years, this.months);
  }

  useSameAddress() {
    let sameAddress = this.BillingFromGroup.value.sameAddress;
    //console.log(sameAddress);
    if (sameAddress == true) {
      this.BillingFromGroup.controls['cardCountry'].setErrors(null);
      this.BillingFromGroup.controls['cardCity'].setErrors(null);
      this.BillingFromGroup.controls['cardAddress'].setErrors(null);
      this.BillingFromGroup.controls['cardState'].setErrors(null);
      this.BillingFromGroup.controls['cardZipCode'].setErrors(null);
    } else {
      this.BillingFromGroup.controls['cardCountry'].setErrors({ required: true });
      this.BillingFromGroup.controls['cardCity'].setErrors({ required: true });
      this.BillingFromGroup.controls['cardAddress'].setErrors({ required: true });
      this.BillingFromGroup.controls['cardState'].setErrors({ required: true });
      this.BillingFromGroup.controls['cardZipCode'].setErrors({ required: true });
    }
  }

  changeFrequency() {
    let frequency = this.BillingFromGroup.value.frequency;
    if (this.selectedPlan) {
      let price = 0;
      if (frequency == 'yearly') {
        price = this.selectedPlan.yearly_price;
      } else {
        price = this.selectedPlan.monthly_price;
      }
      this.BillingFromGroup.patchValue({
        totalPrice: price
      })
    }
  }

  selectPlan(plan) {

    this.selectedPlan = plan;
    this.selectedPlanId = plan.id;
    this.changeFrequency();
    this.enableNext = false;
    this.next();
  }

  savePayment() {
    //console.log(this.BillingFromGroup.value);
    this.BillingFromGroup.reset();
    this.BillingFromGroup.patchValue({
      frequency: 'yearly',
      totalPrice: 0.00,
      sameAddress: false
    })
  }

  public next(): void {
    this.selectedIndex++;
  }

  public previous(): void {
    this.selectedIndex--;
  }

}
