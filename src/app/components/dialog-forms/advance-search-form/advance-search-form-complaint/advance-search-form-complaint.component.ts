import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-complaint',
  templateUrl: './advance-search-form-complaint.component.html',
  styleUrls: ['./advance-search-form-complaint.component.scss']
})
export class AdvanceSearchFormComplaintComponent implements OnInit {
  statusList:Array<any>=STATUS;
  @Input() salesman:Array<any>=[]
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('complaint'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      salesman: new FormControl(),
    })
  }

}
