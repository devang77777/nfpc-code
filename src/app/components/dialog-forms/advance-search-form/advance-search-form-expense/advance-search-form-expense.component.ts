import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-expense',
  templateUrl: './advance-search-form-expense.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormExpenseComponent implements OnInit {
  statusList:Array<any>=STATUS;
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('expense'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      category_name: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
    })
  }


}
