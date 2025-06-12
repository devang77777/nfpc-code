import { Component, OnInit, Input } from '@angular/core';
import { STATUS } from '../../../../app.constant';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-advance-search-form-sensory',
  templateUrl: './advance-search-form-sensory.component.html',
  styleUrls: ['./advance-search-form-sensory.component.scss'],
})
export class AdvanceSearchFormSensoryComponent implements OnInit {
  statusList: Array<any> = STATUS;
  form: FormGroup;
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('sensory-survey'),
      startdate: new FormControl(),
      enddate: new FormControl(),
    });
  }
}
