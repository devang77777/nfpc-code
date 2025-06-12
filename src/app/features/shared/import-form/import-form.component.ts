import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { ApiService } from 'src/app/services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
type AOA = any[][];

@Component({
  selector: 'app-import-form',
  templateUrl: './import-form.component.html',
  styleUrls: ['./import-form.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class ImportFormComponent implements OnInit {

  @Output() public whenFileSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() public returnToMain: EventEmitter<any> = new EventEmitter<any>();
  @Input() public title: string;


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
  public successrecordscountnumber = 0;
  public duplicateData: any = [];
  public unMappedData: any = [];
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  public errorrcount: number = 0;
  public successfields: number = 0;

  stepIndex: number = 0;
  mapFields: {};

  constructor(
    router: Router,
    private formBuilder: FormBuilder,
    private commonToasterService: CommonToasterService,
    private apiService: ApiService
  ) {
    Object.assign(this, { router });
  }

  ngOnInit(): void {
    this.importForm = this.formBuilder.group({
      customer_file: ['', Validators.required],
      skipduplicate: ['', Validators.required]
    });
    this.fieldFrom = this.formBuilder.group({
      mapField: this.formBuilder.array([]),
    });
  }
  get getFieldFrom() {
    return this.fieldFrom.get('mapField') as FormArray;
  }
  backToMain() {
    this.returnToMain.emit();
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
      // this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });
      // //console.log(this.data);
      // this.selected = this.data[0][0];
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
  saveMapFieldsForm() {
    this.mapFields = {};
    const form = this.fieldFrom.getRawValue();

    form.mapField.forEach((element) => {
      this.mapFields[element.label_name] = element.label_value;
    });
  }

  mappingfield() {
    this.apiService.mappingfield(this.title).subscribe((res: any) => {
      if (res.status) {
        //console.log(res);
        this.isActive = false;
        this.data = res.data;
        this.getFieldFrom.controls.length = 0;
        this.data.forEach((element, i) => {
          this.getFieldFrom.push(this.addControl(element));
        });
      }
    });
  }

  addControl(fields) {
    let fGroup = this.formBuilder.group({
      label_name: fields,
      label_value: fields,
    });
    return fGroup;
  }

  finalImport() {
    this.apiService
      .submitFinalImport({ successfileids: this.successfields, skipduplicate: this.importFile.skipduplicate }, this.title)
      .subscribe((res: any) => {
        this.commonToasterService.showSuccess(
          'Data has been imported successfully.'
        );
        this.router.navigateByUrl('/pricing-plan/pricing');
      });
  }

  importData() {
    this.mapFields = {};
    const form = this.fieldFrom.getRawValue();

    form.mapField.forEach((element) => {
      this.mapFields[element.label_name] = element.label_value;
    });
    // this.saveMapFieldsForm();
    if (!this.fieldFrom.invalid) {
      var data = {};
      this.fieldList.forEach(element => {
        data[element] = element;
      });
      const formData = new FormData();
      var field = "";
      switch (this.title) {
        case 'Credit Note':
          field = 'creditnote_file';
          break;
        case 'Pricing':
          field = 'pricing';
          break;
      }


      formData.append(field, this.fileInfo);
      formData.append('skipduplicate', this.importFile.skipduplicate);
      formData.append('map_key_value', JSON.stringify(this.mapFields));


      this.apiService.importReport(formData, this.title).subscribe((res: any) => {
        if (res.status) {
          //console.log(res);
          this.duplicateData = [];
          this.unMappedData = [];
          this.errorrcount = res.data.errorrcount;
          this.successrecordscountnumber = res.data.successrecordscountnumber;
          if (res.errors.length > 0) {
            for (let i = 0; i < res.errors.length; i++) {
              if (res.errors[i].errormessage.includes('already_exists')) {
                if (res.errors[i].errorresult != null) {
                  let data =
                    res.errors[i].errorresult.Email + ' Row already exists';
                  this.duplicateData.push(data);
                }
              } else {
                this.unMappedData.push(res.errors[i].errormessage);
              }
            }
          }
          if (res.data.successfileids > 0) {
            this.isActive = false;
            this.successfields = res.data.successfileids;
          }
          if (res.data.skipduplicate != 0) {
            this.importFile.skipduplicate = res.data.skipduplicate;
          }
          this.moveToNext("Preview");

          // this.stepper.next();
        } else {
        }
      });
    }
    // console.log(importdata);
  }

}

