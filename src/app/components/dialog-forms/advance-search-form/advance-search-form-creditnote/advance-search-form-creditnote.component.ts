import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-creditnote',
  templateUrl: './advance-search-form-creditnote.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormCreditnoteComponent implements OnInit {
  statusList: Array<any> = STATUS;
  @Input() salesman: Array<any> = [];
  domain = window.location.host;
  form: FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('credit_note'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      credit_notes_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
    })
  }

}
