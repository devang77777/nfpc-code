import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { CreditNoteService } from '../credit-note.service';

@Component({
  selector: 'app-credit-note-export',
  templateUrl: './credit-note-export.component.html',
  styleUrls: ['./credit-note-export.component.scss']
})
export class CreditNoteExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  public creditNoteService: CreditNoteService;
  private datePipe: DatePipe;
  storageLocationFormControl = new FormControl([]);
  channelFormControl = new FormControl([]);
  storageLocation: any = [];
  channelList = [];


  constructor(datePipe: DatePipe,
    apiService: ApiService,
    creditNoteService: CreditNoteService) {
    Object.assign(this, { apiService, creditNoteService });
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
      channel_name : new FormControl(''),
      selected_channel: new FormControl(''),
    });
    this.apiService.getLocationStorageListById().subscribe(res => {
      this.storageLocation = [...res.data];
    });
    this.getChannelList();
  }
  selectionchangedstorageLocation() {
    const storage = this.storageLocationFormControl.value;
    this.exportForm.patchValue({
      storage_location_id: storage[0].id
    });
  }


  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }


  applyFilter() {
    const channel = this.channelFormControl.value;
    
    this.exportForm.patchValue({  
        channel_name: channel|| null,
       
    });
}

  exportCredit() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    // console.log(this.export);
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.creditNoteService.exportCreditNote({
      module: 'creditnote',
      criteria: this.export.type,
      start_date: this.export.startDate,
      end_date: this.export.endDate,
      file_type: this.export.fileType,
      // channel_id: this.exportForm.value.channel_name = [],
      channel_id: this.exportForm.value.channel_name.length > 0 ? this.exportForm.value.channel_name.map(i => i.id) : [],
      is_password_protected: 'no',
      branch_plant: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0
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
