import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormControlName } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { PalletService } from '../pallet.service';
import { constants } from 'buffer';

@Component({
  selector: 'app-pallet-export',
  templateUrl: './pallet-export.component.html',
  styleUrls: ['./pallet-export.component.scss']
})
export class PalletExportComponent implements OnInit {
  storageLocationFormControl = new FormControl([]);
   storageLocation: any = [];
  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  divisionFormControl = new FormControl([]);
  zoneFormControl = new FormControl([]);
  zoneList = [];
  public export: any = [];
  divisionList = [];
  warehouseList = [];
  constructor(
    private datePipe: DatePipe,
    private apiService: ApiService,
    private palletService: PalletService,
    private dataEditorService: DataEditor
  ) {
    Object.assign(this, { apiService, palletService });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      is_header_level: new FormControl(''),
      is_division_level: new FormControl(''),
      exportBy: new FormControl(''),
      storage_location_id: new FormControl(''),
      name: new FormControl(''),
    });
   
    // this.getZoneList();
      this.apiService.getLobs().subscribe(lobs => {
      this.divisionList = lobs.data;
    });
     this.apiService.getLocationStorageListById().subscribe(res => {
      this.storageLocation = [...res.data];
    });

   
      
  }
  // getZoneList() {
  //   this.apiService.getAllZoneList().subscribe((res: any) => {
  //     this.zoneList = res.data;
  //   });
  // }
  exportPallet() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    const type = this.export.fileType;
    // if (type === 'csv') {
    //   type = 'file.csv';
    // } else {
    //   type = 'file.xls';
    // }
    this.dataEditorService.sendMessage({ export: 'export' });
    this.palletService.exportPallet({
      module: 'pallet',
      criteria: this.export.type,
      start_date: this.export.startDate ? this.export.startDate : '',
      end_date: this.export.endDate ? this.export.endDate : '',
      file_type: 'csv',
      is_password_protected: 'no',
      type: 1,
      storage_location_id: this.exportForm.value.storage_location_id.length > 0 ? this.exportForm.value.storage_location_id.map(i => i.id) : [],
      // type1: this.export.is_division_level,
      // type:1
      // region_id: this.exportForm.value.name ? this.exportForm.value.name : 0,
    })
      .subscribe(
        (result: any) => {
          if (result.status) {
            this.apiService.downloadFile(result.data.file_url, 'csv');
            this.dataEditorService.sendMessage({ export: '' });
          }
        }
      );
  }
   applyFilter() {
    const division = this.divisionFormControl.value;
    this.exportForm.patchValue({
        division_id: division || null,
       
    });
}
  

  
   selectionchangedstorageLocation() {
    const storage = this.storageLocationFormControl.value;
    this.exportForm.patchValue({
      storage_location_id: storage || null,
    });
  }

}

