import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-promotion-form-page',
  templateUrl: './add-promotion-form-page.component.html',
  styleUrls: ['./add-promotion-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddPromotionFormPageComponent implements OnInit {
  orderType;
  routes;
  customers;
  showOptions;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  l1; l2; l3; l4; l5;
  c1; c2; c3; c4; c5;
  i1; i2; i3;
  constructor(private apiService: ApiService, private _formBuilder: FormBuilder) { }

  ngOnInit(): void {

    // this.apiService.getAllRoute().subscribe(routes => {
    //   this.routes = routes.data;
    //   //console.log(this.routes);

    // })
    // this.apiService.getCustomers().subscribe(customers => {
    //   this.customers = customers.data
    //   //console.log(this.customers);
    // })
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.routes = result.data.routes;
      this.customers = result.data.customers;
    })
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }
  onTypeChange() {

  }
  updateMySelection(event) {
    //console.log(event);

  }
}
