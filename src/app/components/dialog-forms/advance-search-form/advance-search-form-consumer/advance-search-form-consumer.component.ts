import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-advance-search-form-consumer',
  templateUrl: './advance-search-form-consumer.component.html',
  styleUrls: ['./advance-search-form-consumer.component.scss'],
})
export class AdvanceSearchFormConsumerComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() salesman: Array<any> = [];
  @Input() customer: Array<any> = [];
  form: FormGroup;
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('consumer-survey'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      customer: new FormControl(),
    });
  }
}
