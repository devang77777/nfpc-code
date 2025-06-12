import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, DELIVERY_STATUS, ORDER_STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-delivery',
  templateUrl: './advance-search-form-delivery.component.html',
  styleUrls: ['./advance-search-form-delivery.component.scss']
})
export class AdvanceSearchFormDeliveryComponent implements OnInit {
  statusList: Array<any> = STATUS;
  orderStatusList: Array<any> = ORDER_STATUS;
  @Input() salesman: Array<any> = []
  form: FormGroup
  @Input() storageLocation: Array<any> = [];
  branchplantsFormControl = new FormControl([]);

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('delivery'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      delivery_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
      approval_status: new FormControl(),
      storage_location_id: new FormControl(),
    })
  }
  selectionchangedstorageLocation() {
    let storage = this.branchplantsFormControl.value;
    this.form.patchValue({
      storage_location_id: storage.map(i=>i.id)
    });
  }
}
