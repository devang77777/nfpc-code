import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-competitor',
  templateUrl: './advance-search-form-competitor.component.html',
  styleUrls: ['./advance-search-form-competitor.component.scss']
})
export class AdvanceSearchFormCompetitorComponent implements OnInit {
  statusList:Array<any>=STATUS;
  @Input() salesman:Array<any>=[]
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('competitor'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      salesman: new FormControl(),
    })
  }

}
