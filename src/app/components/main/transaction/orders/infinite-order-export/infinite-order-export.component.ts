import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormControlName } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { OrderService } from '../order.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-infinite-order-export',
  templateUrl: './infinite-order-export.component.html',
  styleUrls: ['./infinite-order-export.component.scss']
})
export class InfiniteOrderExportComponent implements OnInit {
  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  storageLocationFormControl = new FormControl([]);
  zoneFormControl = new FormControl([]);
  storageLocation: any = [];
  zoneList = [];
  public export: any = [];

  constructor(
    private datePipe: DatePipe,
    private apiService: ApiService,
    private orderService: OrderService,
    private dataEditorService: DataEditor,
    private CommonToasterService: CommonToasterService
  ) {
    Object.assign(this, { apiService, orderService });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      storage_location_id: new FormControl(''),
      is_header_level: new FormControl(''),
      exportBy: new FormControl(''),
      name: new FormControl(''),
    });
    this.apiService.getLocationStorageListById().subscribe(res => {
      this.storageLocation = [...res.data];
    });
  }
  exportOrder() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.dataEditorService.sendMessage({ export: 'export' });
    this.apiService.infiniteOrder({
      date: this.export.startDate,
      branch: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0,
    })
      .subscribe(
        (result: any) => {
          if (result.status == true) {
            this.CommonToasterService.showSuccess(
              'Success',
              result.message
            );
            this.dataEditorService.sendMessage({ export: '' });
          } else {
            this.CommonToasterService.showError(
              'Error',
              result.message
            );
          }
        }, (error) => {
          this.CommonToasterService.showError(
            'Error',
            'Cannot add order, please try again'
          );
        }
      );
  }
  selectionchangedstorageLocation() {
    const storage = this.storageLocationFormControl.value;
    this.exportForm.patchValue({
      storage_location_id: storage[0].id
    });
  }
}
