import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-purchase-order',
  templateUrl: './advance-search-form-purchase-order.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormPurchaseOrderComponent implements OnInit {

  form:FormGroup;
  statusList:Array<any>=STATUS;
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('purchase_order'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      expected_delivery_start_date: new FormControl(),
      expected_delivery_end_date: new FormControl(),
      purchase_order_no: new FormControl(),
      vendor_name: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
    })
  }

}
