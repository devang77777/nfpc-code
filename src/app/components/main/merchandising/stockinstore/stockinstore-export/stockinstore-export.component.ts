import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { MerchandisingService } from '../../merchandising.service';

@Component({
  selector: 'app-stockinstore-export',
  templateUrl: './stockinstore-export.component.html',
  styleUrls: ['./stockinstore-export.component.scss']
})
export class StockinstoreExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public campaignExportForm: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  public merchandisingService: MerchandisingService;
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
    apiService: ApiService,
    merchandisingService: MerchandisingService) {
    Object.assign(this, { apiService, merchandisingService });
  }

  ngOnInit(): void {
    this.campaignExportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    })

  }

  exportstockinstore() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    //console.log(this.export);
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.merchandisingService
      .ExportCampaign({
        module: 'stockinstore',
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
