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

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  storageLocationFormControl = new FormControl([]);
  zoneFormControl = new FormControl([]);
  storageLocation: any = [];
  zoneList = [];
  public export: any = [];

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
      storage_location_id: new FormControl(''),
      is_header_level: new FormControl(''),
      exportBy: new FormControl(''),
      name: new FormControl(''),
    });
    // this.apiService.getLocationStorageListById().subscribe(res => {
    //   this.storageLocation = [...res.data];
    // });
    // this.getZoneList();
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
      file_type: type,
      is_password_protected: 'no',
      type: this.export.is_header_level,
      // storage_location_id: this.exportForm.value.storage_location_id ? this.exportForm.value.storage_location_id : 0,
      // region_id: this.exportForm.value.name ? this.exportForm.value.name : 0,
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
  // selectionchangedstorageLocation() {
  //   const storage = this.storageLocationFormControl.value;
  //   this.exportForm.patchValue({
  //     storage_location_id: storage[0].id
  //   });
  // }
  // applyFilter() {
  //   const zone = this.zoneFormControl.value;
  //   this.exportForm.patchValue({
  //     name: zone[0].id
  //   });
  // }

}

