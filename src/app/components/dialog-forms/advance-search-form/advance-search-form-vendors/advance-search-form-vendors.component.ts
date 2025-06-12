import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-vendors',
  templateUrl: './advance-search-form-vendors.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormVendorsComponent implements OnInit {
  statusList:Array<any>=STATUS;
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('vendor'),
      firstname: new FormControl(),
      lastname: new FormControl(),
      company_name: new FormControl(),
      mobile: new FormControl(),
      email: new FormControl(),
    })
  }


}
