import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, PAYMENT_METHOD } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-collections',
  templateUrl: './advance-search-form-collections.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormCollectionsComponent implements OnInit {
  statusList:Array<any>=STATUS;
  paymentMethod:Array<any>=PAYMENT_METHOD;
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('collection'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      collection_no: new FormControl(),
      payment_method:  new FormControl(),
      current_stage :  new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
    })
  }


}
