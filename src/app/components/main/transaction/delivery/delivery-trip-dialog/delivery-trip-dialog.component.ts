import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-delivery-trip-dialog',
  templateUrl: './delivery-trip-dialog.component.html',
  styleUrls: ['./delivery-trip-dialog.component.scss'],
})
export class DeliveryTripDialogComponent implements OnInit {
  pipe = new DatePipe('en-US');
  public exportTrip: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  // public invoiceServices: InvoiceServices;
  private datePipe: DatePipe;
  @Output() readonly updateTrip: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    apiService: ApiService,
    private commonToasterService: CommonToasterService,
    public dialogRef: MatDialogRef<DeliveryTripDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    Object.assign(this, {
      apiService,
      commonToasterService,
    });
  }

  ngOnInit(): void {
    this.exportTrip = new FormGroup({
      trip: new FormControl(1),
    });
  }

  submitTripData() {
    let model: any = {
      delivery_id: 0,
      trip: 0,
    };
    this.data.forEach((element) => {
      (model.delivery_id = element.delivery_id),
        (model.trip = this.exportTrip.controls.trip.value);
    });
    this.apiService.deliveryTripChange(model).subscribe(
      (res) => {
        this.commonToasterService.showSuccess('Successfully!', res.message);
        this.updateTrip.emit(res.status);
      },
      (err) => {
        if (err.error.errors?.length > 0) {
          err.error.errors?.forEach((element) => {
            this.commonToasterService.showError(element);
          });
        }
      }
    );
  }
}
