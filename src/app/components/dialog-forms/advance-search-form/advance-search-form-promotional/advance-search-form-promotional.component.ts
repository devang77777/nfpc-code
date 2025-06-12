import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-advance-search-form-promotional',
  templateUrl: './advance-search-form-promotional.component.html',
  styleUrls: ['./advance-search-form-promotional.component.scss'],
})
export class AdvanceSearchFormPromotionalComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() items: Array<any> = [];
  form: FormGroup;
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('promotional'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      item: new FormControl(),
    });
  }
}
