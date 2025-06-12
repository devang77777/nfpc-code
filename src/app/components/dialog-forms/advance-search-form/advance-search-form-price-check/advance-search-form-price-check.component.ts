import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-advance-search-form-price-check',
  templateUrl: './advance-search-form-price-check.component.html',
  styleUrls: ['./advance-search-form-price-check.component.scss']
})
export class AdvanceSearchFormPriceCheckComponent implements OnInit {

  statusList: Array<any> = STATUS;
  @Input() customer: Array<any> = []
  @Input() brands: Array<any> = []
  @Input() merchandisers: Array<any> = []
  form: FormGroup;
  constructor() { }
  customersFormControl = new FormControl([]);
  merchandisersFormControl = new FormControl([]);
  brandsFormControl = new FormControl([]);
  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('price-check'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      customer: new FormControl(),
      merchandiser: new FormControl(),
      brand: new FormControl(),
    })
  }

  selectionchangedCustomer() {
    let customers = this.customersFormControl.value;
    let customer = [];
    customers.forEach(element => {
      customer.push(element.id);
    });
    this.form.patchValue({
      customer: customer
    });
  }

  selectionchangedMerchandiser() {
    let merchandisers = this.merchandisersFormControl.value;
    let merchandiser = [];
    merchandisers.forEach(element => {
      merchandiser.push(element.id);
    });
    this.form.patchValue({
      merchandiser: merchandiser
    });
  }
  selectionchangedBrand() {
    let brands = this.brandsFormControl.value;
    let brand = [];
    brands.forEach(element => {
      brand.push(element.id);
    });
    this.form.patchValue({
      brand: brand
    });
  }

}
