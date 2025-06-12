import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { TargetService } from '../../../targets/target.service';

@Component({
  selector: 'app-grn-export',
  templateUrl: './grn-export.component.html',
  styleUrls: ['./grn-export.component.scss']
})
export class GrnExportComponent implements OnInit {
  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private datePipe: DatePipe;
  storageLocationFormControl = new FormControl([]);
  channelFormControl = new FormControl([]);
  storageLocation: any = [];
  channelList : any =[];
  constructor(datePipe: DatePipe,
    private apiService: ApiService,
    private tService: TargetService
  ) {
    Object.assign(this, { apiService });
  }

  ngOnInit(): void {
    this.getChannelList();
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
  }

  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }
  selectionchangedstorageLocation() {
    const storage = this.storageLocationFormControl.value;
    this.exportForm.patchValue({
      storage_location_id: storage[0].id
    });
  }
  exportGRN() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    // console.log(this.export);
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.tService.exportGRN({
      module: 'grn',
      criteria: this.export.type,
      start_date: this.export.startDate,
      end_date: this.export.endDate,
      file_type: this.export.fileType,
      is_password_protected: 'no',
      branch_plant: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0,
      channel_id: this.exportForm.value.channel_name.length > 0 ? this.exportForm.value.channel_name.map(i => i.id) : [],
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

  applyFilter() {
    const channel = this.channelFormControl.value;
    this.exportForm.patchValue({
        channel_name: channel || null,
    });
}
}
