import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-download-pdf',
  templateUrl: './download-pdf.component.html',
  styleUrls: ['./download-pdf.component.scss']
})
export class DownloadPdfComponent implements OnInit {
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
    private dataEditorService: DataEditor,
    private CommonToasterService: CommonToasterService
  ) {
    Object.assign(this, { apiService });
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
    // let type = this.export.fileType;
    let type = 'pdf';
    // if (type === 'csv') {
    //   type = 'file.csv';
    // } else {
    //   type = 'file.xls';
    // }
    this.dataEditorService.sendMessage({ export: 'export' });
    this.apiService.groupPDfDownload({
      date: this.export.startDate,
      id: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0,
    })
      .subscribe(
        (result: any) => {
          if (result.status == true) {
            if (result.data.length > 0) {
              result.data.forEach(element => {
                this.apiService.downloadFile(element, type);

                // this.apiService.downloadFile(result.data.file_url, type);
              });
            }
            this.dataEditorService.sendMessage({ export: '' });
            //   this.CommonToasterService.showSuccess(
            //     'Success',
            //     result.message
            //   );
            //   this.dataEditorService.sendMessage({ export: '' });
          } else {
            this.CommonToasterService.showError(
              'Error',
              result.message
            );
          }
        }, (error) => {
          this.CommonToasterService.showError(
            'Error',
            'Cannot download pdf, please try again'
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
