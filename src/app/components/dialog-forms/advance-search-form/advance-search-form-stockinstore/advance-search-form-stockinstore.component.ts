import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-stockinstore',
  templateUrl: './advance-search-form-stockinstore.component.html',
  styleUrls: ['./advance-search-form-stockinstore.component.scss']
})
export class AdvanceSearchFormStockinstoreComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() customer: Array<any> = []
  form: FormGroup
  constructor() { }
  customersFormControl = new FormControl([]);
  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('stock_in_store'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      back_store: new FormControl(),
      customer_code: new FormControl(),
      customer: new FormControl(),
    })
  }

  selectionchanged() {
    let customers = this.customersFormControl.value;
    let customer = [];
    customers.forEach(element => {
      customer.push(element.id);
    });
    this.form.patchValue({
      customer: customer
    });
  }

}
