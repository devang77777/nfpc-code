import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormControlName } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { OrderService } from '../order.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { element } from 'protractor';

@Component({
  selector: 'app-order-export',
  templateUrl: './order-export.component.html',
  styleUrls: ['./order-export.component.scss']
})

export class OrderExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  storageLocationFormControl = new FormControl([]);
  zoneFormControl = new FormControl([]);
  channelFormControl = new FormControl([]);
  storageLocation: any = [];
  zoneList = [];
  channelList :any= [];
  public export: any = [];
  private apiService: ApiService;
  public orderService: OrderService;
  private datePipe: DatePipe;

  constructor(datePipe: DatePipe,
    apiService: ApiService,
    orderService: OrderService,
    private dataEditorService: DataEditor
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
      channelBy: new FormControl(''),
      name: new FormControl(''),
      channel_name: new FormControl(''),
      selected_channel: new FormControl(''),
      
    });
    this.apiService.getLocationStorageListById().subscribe(res => {
      this.storageLocation = [...res.data];
    });
    this.getZoneList();
    this.getChannelList();
  }
  getZoneList() {
    this.apiService.getAllZoneList().subscribe((res: any) => {
      this.zoneList = res.data;
    });
  }
  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
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
    this.orderService.exportOrder({
      module: 'order',
      criteria: this.export.type,
      start_date: this.export.startDate,
      end_date: this.export.endDate,
      file_type: type,
      // channel_id: [[this.exportForm.value.channel_name]],
      channel_id: this.exportForm.value.channel_name.length > 0 ? this.exportForm.value.channel_name.map(i => i.id) : [],
      is_password_protected: 'no',
      is_header_level: this.export.is_header_level,
      storage_location_id: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0,
      region_id: this.exportForm.value.name ? this.exportForm.value.name : 0,
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
  selectionchangedstorageLocation() {
    const storage = this.storageLocationFormControl.value;
    this.exportForm.patchValue({
      storage_location_id: storage[0].id,
    });
  }
  // applyFilter() {
  //   const zone = this.zoneFormControl.value;
  //   const channel = this.channelFormControl.value;
  //   this.exportForm.patchValue({
  //     name: zone[0].id,
  //     channel_name: channel[0].id
  //   });
  // }


  applyFilter() {
    const zone = this.zoneFormControl.value;
    const channel = this.channelFormControl.value;

    this.exportForm.patchValue({
        name: zone[0]?.id || null,  
        channel_name: channel || null,
       
    });
}


}
