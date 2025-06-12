import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { Item } from 'angular2-multiselect-dropdown';

@Component({
  selector: 'app-customer-pricing-export',
  templateUrl: './customer-pricing-export.component.html',
  styleUrls: ['./customer-pricing-export.component.scss']
})
export class CustomerPricingExportComponent implements OnInit {
  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = {};
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
    private apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      item_price: new FormControl(''),
      // startDate: new FormControl(''),
      // endDate: new FormControl('')
    })

  }

  exportPricing() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
      const criteria = this.export.type || 'all'; 
    this.apiService
      .exportCustomers({
        module: 'customer-based-price',
        criteria: criteria,
        start_date: '',
        end_date: '',
        file_type: this.export.fileType,
        is_password_protected: 'no',
        customer_id: '',
        active: this.export.item_price,
      })
      .subscribe(
        (result: any) => {
          if (result.status) {
            // console.log(result);
            this.apiService.downloadFile(result.data.file_url, type);
          }
        }
      );
  }
}
