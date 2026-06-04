import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
// import { CreditNoteService } from '../credit-note.service';
@Component({
  selector: 'app-caps-export',
  templateUrl: './caps-export.component.html',
  styleUrls: ['./caps-export.component.scss']
})
export class CapsExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  // public creditNoteService: CreditNoteService;
  private datePipe: DatePipe;
  storageLocationFormControl = new FormControl([]);
  channelFormControl = new FormControl([]);
  storageLocation: any = [];
  channelList = [];

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];
  selectedYear: number | null = null;
  selectedMonth: string | null = null;


  constructor(datePipe: DatePipe,
    apiService: ApiService,
    // creditNoteService: CreditNoteService
  ) {
    Object.assign(this, { apiService,
       // creditNoteService 
    });
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
      year: new FormControl(''),
      month: new FormControl(''),
    });
    this.apiService.getLocationStorageListById().subscribe(res => {
      this.storageLocation = [...res.data];
    });
    this.getChannelList();

    // Populate years (e.g., from 2015 to current year)
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2015; y--) {
      this.years.push(y);
    }
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
    // If Specific Customer CAPS, use year and month
    if (this.export.type === '1') {
      this.export.year = this.exportForm.value.year;
      this.export.month = this.exportForm.value.month;
    }
    this.apiService.capsExport({
    
      file_type: this.export.fileType,
      year: this.exportForm.value.year,
      month: this.exportForm.value.month
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
