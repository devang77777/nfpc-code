import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, INVOICE_STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-invoice',
  templateUrl: './advance-search-form-invoice.component.html',
  styleUrls: ['./advance-search-form-invoice.component.scss']
})
export class AdvanceSearchFormInvoiceComponent implements OnInit {
  form: FormGroup;
  statusList: Array<any> = INVOICE_STATUS;
  @Input() salesman: Array<any> = [];
  @Input() storageLocation: Array<any> = [];
  customersFormControl = new FormControl([]);
  branchplantsFormControl = new FormControl([]);

  constructor(private detChange: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('invoice'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      invoice_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
      order_no: new FormControl(),
      storage_location_id: new FormControl(),
    });
  }
  selectionchangedstorageLocation() {
    const storage = this.branchplantsFormControl.value;
    this.form.patchValue({
      storage_location_id: storage[0].id
    });
  }


}
