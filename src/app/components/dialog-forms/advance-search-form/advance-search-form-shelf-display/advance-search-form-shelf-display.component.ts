import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-shelf-display',
  templateUrl: './advance-search-form-shelf-display.component.html',
  styleUrls: ['./advance-search-form-shelf-display.component.scss']
})
export class AdvanceSearchFormShelfDisplayComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() customer: Array<any> = []
  form: FormGroup
  constructor() { }
  customersFormControl = new FormControl([]);
  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('shelf-display'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      display_name: new FormControl(),
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
