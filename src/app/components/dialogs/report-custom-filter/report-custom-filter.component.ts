import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MerchandisingService } from '../../main/merchandising/merchandising.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
@Component({
  selector: 'app-report-custom-filter',
  templateUrl: './report-custom-filter.component.html',
  styleUrls: ['./report-custom-filter.component.scss']
})
export class ReportCustomFilterComponent implements OnInit {
  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  constructor(
    apiService: ApiService,
    public merService: MerchandisingService,
    private cd: ChangeDetectorRef,
    private cts: CommonToasterService,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public customersData: any,
    private dialog: MatDialogRef<ReportCustomFilterComponent>
  ) {
    Object.assign(this, { apiService });
  }

  custom_report_filter;
  selectedDate = {
    startdate: null,
    enddate: null
  };
  ngOnInit(): void {
    this.custom_report_filter = this.fb.group({
      startdate: ['', Validators.required],
      enddate: ['', Validators.required],
    })
    if (this.customersData.startdate !== '' && this.customersData.enddate !== '') {
      this.selectedDate = { startdate: moment(this.customersData.startdate + "T00:00Z", 'YYYY-MM-DD'), enddate: moment(this.customersData.enddate + "T00:00Z", 'YYYY-MM-DD') };
      this.custom_report_filter.patchValue({
        startdate: this.customersData.startdate,
        enddate: this.customersData.enddate
      })
    }

  }

  setDatePickerDate(value, type) {
    if (type == 'startdate') {
      this.selectedDate.startdate = moment(value + "T00:00Z");
    } else {
      this.selectedDate.enddate = moment(value + "T00:00Z");
    }
  }

  choosedDate(event) {
    this.custom_report_filter.patchValue({
      startdate: moment(event.startDate).format("YYYY-MM-DD"),
      enddate: moment(event.endDate).format("YYYY-MM-DD")
    })
  }

  applyCustomFilter() {
    this.dialog.close(this.custom_report_filter.value);
  }

  close() {
    this.dialog.close();
  }

}
