import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-estimates',
  templateUrl: './advance-search-form-estimates.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormEstimatesComponent implements OnInit {
  statusList:Array<any>=STATUS;
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('estimate'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      estimate_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
    })
  }


}
