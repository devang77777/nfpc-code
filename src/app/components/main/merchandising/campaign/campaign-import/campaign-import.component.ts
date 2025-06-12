import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MerchandisingService } from '../../merchandising.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
type AOA = any[][];

@Component({
  selector: 'app-campaign-import',
  templateUrl: './campaign-import.component.html',
  styleUrls: ['./campaign-import.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]

})
export class CampaignImportComponent implements OnInit {

  public importForm: FormGroup;
  public fieldFrom: FormGroup;
  private router: Router;
  public importFile: any = {};
  public filesList: string[] = [];
  public removable = true;
  public fileName1: string[] = [];
  public data: any = [];
  public file: any = [];
  public fileInfo: string;
  panelOpenState: boolean = false;
  public selectedFiles = [];
  public unmappedList = [];
  public unMappedCount;
  public fieldList: any = [];
  public duplicate: any = [];
  public activeTab: boolean = false;
  public isFlag: boolean = true;


  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';

  stepIndex: number = 0;
  cambiaStep(e) {
    this.stepIndex = e.selectedIndex;
  }

  constructor(
    router: Router,
    private merchandisingService: MerchandisingService,
    private commonToasterService: CommonToasterService,
    private formBuilder: FormBuilder
  ) {
    Object.assign(this, { router });
  }

  ngOnInit(): void {
    this.importForm = new FormGroup({
      competitorinfo_file: new FormControl(''),
      skipduplicate: new FormControl(''),
    });

    this.fieldFrom = new FormGroup({
      mapField: new FormControl('')
    });
  }

  bactToCampaign() {
    this.router.navigate(['merchandising/campaigns/']).then();
  }

  mapChange(event) {
    if (this.fieldList.length > 0) {
      for (let i = 0; i < this.fieldList.length; i++) {
        if (this.fieldList[i] === event) {
          this.isFlag = true;
          // this.fieldList.splice(i, 1);
          this.commonToasterService.showWarning(
            'Warrning',
            event + ' Column has been matched with multiple columns.'
          );
          break;
        }
      }
      this.isFlag = false;
      this.fieldList.push(event)
      //console.log(this.isFlag);
      //console.log(this.fieldList);
    } else {
      this.isFlag = false;
      this.fieldList.push(event);
    }
  }

  onSelectFile(input: HTMLInputElement, event) {
    this.fileInfo = event.target.files[0];

    for (var i = 0; i < event.target.files.length; i++) {
      this.filesList.push(event.target.files[i]);
      this.fileName1.push(event.target.files[i].name);
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

      var keys = {}; // store the keys that you have processed
      var result = []; // array with accepted rows
      for (var i = 0; i < wsname.length; i++) {
        var singleRowData = wsname[i].split(',');
        singleRowData = singleRowData.filter(function (n) { return n != "" });
        var key = singleRowData[0] + '|' + singleRowData[4]; // CN + NAME
        if (key in keys) {
          //console.log("Duplicate at " + wsname[i] + " is ignored");
          //console.log("Duplicate at " + i + " is ignored");
          this.duplicate.push(i);
        } else {
          keys[key] = 1; // register key
          result.push(singleRowData);
        }
      }

    };

    reader.readAsBinaryString(target.files[0]);
  }

  remove(filesList): void {
    const index = this.fileName1.indexOf(filesList);
    if (index >= 0) {
      this.fileName1.splice(index, 1);
    }
  }

  loadFields() {
    //console.log(this.data[0]);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
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

  importCampaign() {
    const formData = new FormData();
    formData.append('campagin_file', this.fileInfo);
    formData.append('skipduplicate', this.importFile.skipduplicate);

    this.merchandisingService.importCampaign(formData).subscribe((res: any) => {
      if (res.status) {
        //console.log(res);
        this.activeTab = true;
        this.moveToNext("Map Fields");
        this.unMappedCount = 0;
        for (let i = 0; i < res.errors[0].length; i++) {
          let text = res.errors[0].toString().split(".")[i];
          if (text != null) {
            var field = text.split(",");
            this.unmappedList.push(field[0]);
          }
        }
        this.unmappedList.slice(0, 1);
        //console.log(this.unmappedList);
        this.unMappedCount = this.unmappedList.length;
      }
    });
  }

}
