import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-advance-search-form-market-promotion',
  templateUrl: './advance-search-form-market-promotion.component.html',
  styleUrls: ['./advance-search-form-market-promotion.component.scss']
})
export class AdvanceSearchFormMarketPromotionComponent implements OnInit {

  statusList: Array<any> = STATUS;
  @Input() customer: Array<any> = []
  @Input() merchandisers: Array<any> = []
  form: FormGroup;
  customersFormControl = new FormControl([]);
  merchandisersFormControl = new FormControl([]);
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('market-promotion'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      customer: new FormControl(),
      merchandiser: new FormControl(),
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

}
