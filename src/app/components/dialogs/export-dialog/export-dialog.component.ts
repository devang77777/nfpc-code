import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    })

  }
  exportFiles() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.apiService.exportCommonFiles({
      module: this.data.module,
      criteria: this.export.type,
      start_date: this.export.startDate,
      end_date: this.export.endDate,
      file_type: this.export.fileType,
      is_password_protected: 'no'
    })
      .subscribe(
        (result: any) => {
          if (result.status) {
            //console.log(result);
            this.apiService.downloadFile(result.data.file_url, type);
          }
        }
      );
  }
}
