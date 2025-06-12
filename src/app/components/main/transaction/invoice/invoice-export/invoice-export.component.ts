import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { InvoiceServices } from '../invoice.service';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-invoice-export',
  templateUrl: './invoice-export.component.html',
  styleUrls: ['./invoice-export.component.scss']
})
export class InvoiceExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  public invoiceServices: InvoiceServices;
  private datePipe: DatePipe;
  storageLocationFormControl = new FormControl([]);
  channelFormControl = new FormControl([]);
  storageLocation: any = [];
  channelList : any = [];
  
  constructor(datePipe: DatePipe,
    apiService: ApiService,
    invoiceServices: InvoiceServices,
    private dataEditorService: DataEditor
  ) {
    Object.assign(this, { apiService, invoiceServices });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      storage_location_id: new FormControl(''),
      exportBy: new FormControl(''),
      channelBy: new FormControl(''),
      channel_name: new FormControl(''),
    });
    this.apiService.getLocationStorageListById().subscribe(res => {
      this.storageLocation = [...res.data];
    });
    this.getChannelList();
  }

  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }


  selectionchangedstorageLocation() {
    const storage = this.storageLocationFormControl.value;
    this.exportForm.patchValue({
      storage_location_id: storage[0]?.id || null,
    });
  }
  exportInvoice() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    // console.log(this.export);
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.dataEditorService.sendMessage({ export: 'export' });
    this.invoiceServices.exportInvoice({
      module: 'invoice',
      criteria: this.export.type,
      // channel_id: this.exportForm.value.channel_name,
      channel_id: this.exportForm.value.channel_name.length > 0 ? this.exportForm.value.channel_name.map(i => i.id) : [],
      start_date: this.export.startDate,
      end_date: this.export.endDate,
      file_type: this.export.fileType,
      is_password_protected: 'no',
      branch_plant: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0
    })
      .subscribe(
        (result: any) => {
          if (result.status) {
            //console.log(result);
            this.apiService.downloadFile(result.data.file_url, type);
            this.dataEditorService.sendMessage({ export: '' });
          }
        }
      );
  }
  applyFilter() {
    const channel = this.channelFormControl.value;
    this.exportForm.patchValue({
        channel_name: channel || null,
       
    });
}

 

 
}
