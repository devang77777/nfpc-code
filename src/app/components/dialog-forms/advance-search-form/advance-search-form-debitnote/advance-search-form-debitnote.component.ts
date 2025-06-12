import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-debitnote',
  templateUrl: './advance-search-form-debitnote.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormDebitnoteComponent implements OnInit {
  statusList:Array<any>=STATUS;
  @Input() salesman:Array<any>=[]
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('debit_note'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      debit_note_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
    })
  }


}
