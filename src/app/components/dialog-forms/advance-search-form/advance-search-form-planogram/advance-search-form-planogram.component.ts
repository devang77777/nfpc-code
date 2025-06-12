import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-advance-search-form-planogram',
  templateUrl: './advance-search-form-planogram.component.html',
  styleUrls: ['./advance-search-form-planogram.component.scss'],
})
export class AdvanceSearchFormPlanogramComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() salesman: Array<any> = [];
  @Input() customer: Array<any> = [];
  form: FormGroup;
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('planogram'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      customer: new FormControl(),
    });
  }
}
