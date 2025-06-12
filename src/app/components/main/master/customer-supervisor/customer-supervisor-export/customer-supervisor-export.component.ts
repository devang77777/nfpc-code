import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormControlName } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
// import { OrderService } from '../order.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { element } from 'protractor';
import { CustomerService } from '../../customer/customer.service';
@Component({
  selector: 'app-customer-supervisor-export',
  templateUrl: './customer-supervisor-export.component.html',
  styleUrls: ['./customer-supervisor-export.component.scss']
})
export class CustomerSupervisorExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  private customerService: CustomerService;
  // public orderService: OrderService;
  private datePipe: DatePipe;

  constructor(datePipe: DatePipe,
    customerService: CustomerService,
    apiService: ApiService,
    // orderService: OrderService,
    private dataEditorService: DataEditor
  ) {
    Object.assign(this, { apiService,customerService });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      
    });
   
  }
  
 
  exportCustomerSupervisor() {
    // this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    // this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.dataEditorService.sendMessage({ export: 'export' });
    this.customerService.exportSupervisorList({
     export:"1",
    })
    
      .subscribe(
        (result: any) => {
          if (result.status) {
            this.apiService.downloadFile(result.data.file_url, type);
            this.dataEditorService.sendMessage({ export: '' });
          }
        }
      );
      
  }
  

  

}
