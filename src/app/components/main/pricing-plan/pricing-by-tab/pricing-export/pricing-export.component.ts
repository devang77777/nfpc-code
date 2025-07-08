import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-pricing-export',
  templateUrl: './pricing-export.component.html',
  styleUrls: ['./pricing-export.component.scss'],
  providers: [DatePipe]
})
export class PricingExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  channelFormControl = new FormControl([]);
  public export: any = {};
  channelList = [];
  private apiService: ApiService;
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
    apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      
      type: new FormControl(''),
      fileType: new FormControl(''),
      channelBy: new FormControl(''),
      channel_name: new FormControl(''),
      selected_channel: new FormControl(''),
      // startDate: new FormControl(''),
      // endDate: new FormControl('')
    })
    this.getChannelList();
  }


  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }
  applyFilter() {
    const channel = this.channelFormControl.value;
    this.exportForm.patchValue({
        channel_name: channel || null,
    });
}

  exportPricing() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    //console.log(this.export);
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.apiService
      .exportCustomers({
        module: 'item-based-price',
        criteria: 'all',
        start_date: '',
        end_date: '',
        file_type: this.export.fileType,
        // channel_id: this.exportForm.value.channel_name,
        channel_id: this.exportForm.value.channel_name.length > 0 ? this.exportForm.value.channel_name.map(i => i.id) : [],
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
