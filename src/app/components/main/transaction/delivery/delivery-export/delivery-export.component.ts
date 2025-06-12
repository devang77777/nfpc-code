import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { DeliveryService } from '../delivery.service';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-delivery-export',
  templateUrl: './delivery-export.component.html',
  styleUrls: ['./delivery-export.component.scss']
})
export class DeliveryExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  public deliveryService: DeliveryService;
  private datePipe: DatePipe
  storageLocationFormControl = new FormControl([]);
  zoneFormControl = new FormControl([]);
  channelFormControl = new FormControl([]);
  storageLocation: any = [];
  zoneList = [];
  channelList : any = [];
  constructor(datePipe: DatePipe,
    apiService: ApiService,
    deliveryService: DeliveryService,
    private dataEditorService: DataEditor
  ) {
    Object.assign(this, { apiService, deliveryService });
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
      channelBy: new FormControl(''),
      channel_name : new FormControl(''),
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

  exportDelivery() {
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
    this.deliveryService.exportDelivery({
      module: 'delivery-assign-template',
      criteria: this.export.type,
      start_date: this.export.startDate,
      // channel_id: this.exportForm.value.channel_name.length > 0 ? this.exportForm.value.channel_name.map(i => i.id) : [],
      channel_id: this.exportForm.value.channel_name.length > 0 ? this.exportForm.value.channel_name.map(i => i.id) : [],
      end_date: this.export.endDate,
      file_type: this.export.fileType,
      is_password_protected: 'no',
      is_header_level: this.export.is_header_level,
      storage_location_id: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0,
      region_id: this.exportForm.value.name ? this.exportForm.value.name : 0,
    })
      .subscribe(
        (result: any) => {
          if (result.status) {
            // console.log(result);
            this.apiService.downloadFile(result.data.file_url, type);
            this.dataEditorService.sendMessage({ export: '' });
          }
        }
      );
  }
  selectionchangedstorageLocation() {
    const storage = this.storageLocationFormControl.value;
    this.exportForm.patchValue({
      storage_location_id: storage[0].id
    });
  }
  applyFilter() {
    const zone = this.zoneFormControl.value;
    const channel = this.channelFormControl.value;

    this.exportForm.patchValue({
        name: zone[0]?.id || null,  
        channel_name: channel || null,
       
    });
}
}
