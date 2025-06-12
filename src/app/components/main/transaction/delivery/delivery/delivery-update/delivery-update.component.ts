import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { DeliveryService } from '../delivery.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
type AOA = any[][];

@Component({
  selector: 'app-delivery-update',
  templateUrl: './delivery-update.component.html',
  styleUrls: ['./delivery-update.component.scss']
})
export class DeliveryUpdateComponent implements OnInit {

  public importForm: FormGroup;
  public fieldFrom: FormGroup;
  private router: Router;
  public importFile: any = {};
  public filesList: string[] = [];
  public removable = true;
  public data: any = [];
  public fileInfo: string;
  public panelOpenState: boolean = false;
  public unmappedList = [];
  public unMappedCount;
  public fieldList: any = [];
  public duplicate: any = [];
  public activeTab: boolean = false;
  public isActive: boolean = false;
  public isOptional = false;
  public selected: string;

  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  stepIndex: number = 0;

  constructor(
    router: Router,
    private formBuilder: FormBuilder,
    private commonToasterService: CommonToasterService,
    private deliveryService: DeliveryService
  ) {
    Object.assign(this, { router });
  }

  ngOnInit(): void {
    this.importForm = this.formBuilder.group({
      customer_file: ['', Validators.required],
    });

  }

  backToMain() {
    this.router.navigate(['transaction/delivery']).then();
  }

  mapChange(event) {
    if (this.fieldList.length > 0) {
      for (let i = 0; i < this.fieldList.length; i++) {
        if (this.fieldList[i] === event) {
          this.fieldList.splice(i, 1);
          this.commonToasterService.showWarning(
            'Warrning',
            event + ' Column has been matched with multiple columns.'
          );
        }
      }
      this.fieldList.push(event);
      //console.log(this.fieldList);
    } else {
      this.fieldList.push(event);
    }
  }

  onSelectFile(event) {
    if (event.target.files.length > 0) {
      this.fileInfo = event.target.files[0];
      this.filesList.push(event.target.files[0]);
    }

    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });
      //console.log(this.data);
      this.selected = this.data[0][0];
      //console.log(this.selected);
    };

    reader.readAsBinaryString(target.files[0]);
  }

  remove(filesList): void {
    const index = this.filesList.indexOf(filesList);
    if (index >= 0) {
      this.filesList.splice(index, 1);
    }
  }

  moveToNext(tabName) {
    for (let i = 0; i < document.querySelectorAll('.mat-tab-label-content').length; i++) {
      if ((<HTMLElement>document.querySelectorAll('.mat-tab-label-content')[i]).innerText == tabName) {
        (<HTMLElement>document.querySelectorAll('.mat-tab-label')[i]).click();
      }
    }
    this.activeTab = true;
  }

  submitMapFields() {
    //console.log(this.fieldFrom);
    this.moveToNext("Preview");
  }

  importData() {

    let importdata = {
      'file': this.fileInfo,
      'skipduplicate': 1,
      mappedFields: this.fieldList
    };
    const formData = new FormData();
    formData.append('delivery_update_file', this.fileInfo);

    this.deliveryService.updateDelivery(formData).subscribe((res: any) => {
      if (res.status) {
        this.backToMain();
        this.commonToasterService.showSuccess(
          'Success',
          res.message
        );
      }
    });
    //console.log(importdata);
  }

}
