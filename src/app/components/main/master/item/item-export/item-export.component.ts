import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { MasterService } from '../../master.service';

@Component({
  selector: 'app-item-export',
  templateUrl: './item-export.component.html',
  styleUrls: ['./item-export.component.scss']
})
export class ItemExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = {};
  private apiService: ApiService;
  private masterService: MasterService;
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
    apiService: ApiService,
    masterService: MasterService) {
    Object.assign(this, { apiService, masterService });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    })

  }

  exportItem() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    //console.log(this.export);
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.masterService
      .exportItem({
        module: 'item',
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
