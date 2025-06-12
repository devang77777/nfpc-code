import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { CustomerService } from '../customer.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatStepper } from '@angular/material/stepper';
import { environment } from 'src/environments/environment';
type AOA = any[][];

@Component({
  selector: 'app-customer-import',
  templateUrl: './customer-import.component.html',
  styleUrls: ['./customer-import.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class CustomerImportComponent implements OnInit {
  public domain = environment.host;
  public importForm: FormGroup;
  public fieldFrom: FormGroup;
  private router: Router;
  public importFile: any = {};
  public filesList: string[] = [];
  public removable = true;
  public data: any = [];
  public fileInfo: string;
  panelOpenState: boolean = false;
  public fieldList: any = [];
  public duplicate: any = [];
  public activeTab: boolean = false;
  public isActive: boolean = true;
  public isOptional = false;
  public selected: string;
  public mapFields: any = {};
  public errorrcount: number = 0;
  public successfields: number = 0;
  public skipduplicate: any = 0;
  public successrecordscountnumber = 0;
  public duplicateData: any = [];
  public unMappedData: any = [];
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  @ViewChild('stepper') private stepper: MatStepper;

  stepIndex: number = 0;

  constructor(
    private customerService: CustomerService,
    router: Router,
    private formBuilder: FormBuilder,

    private commonToasterService: CommonToasterService
  ) {
    Object.assign(this, { customerService, router });
  }

  ngOnInit(): void {
    this.importForm = new FormGroup({
      customer_file: new FormControl(),
      skipduplicate: new FormControl(),
    });
    this.fieldFrom = new FormGroup({
      mapField: this.formBuilder.array([]),
    });
  }

  saveMapFieldsForm() {
    this.mapFields = {};
    const form = this.fieldFrom.getRawValue();

    form.mapField.forEach((element) => {
      this.mapFields[element.label_name] = element.label_value;
    });
    this.importCustomer();
  }

  backToCustomer() {
    this.router.navigate(['masters/customer']);
  }
  get getFieldFrom() {
    return this.fieldFrom.get('mapField') as FormArray;
  }

  addControl(fields) {
    let fGroup = this.formBuilder.group({
      label_name: fields,
      label_value: fields,
    });
    return fGroup;
  }

  mapChange(value) {
    // Same Column header has been matched with multiple columns.
    let form = this.fieldFrom.getRawValue();
    let count = 0;
    for (let i = 0; i < form.mapField.length; i++) {
      if (form.mapField[i].label_value === value) {
        this.isActive = false;
        ++count;
      }
      if (count >= 2) {
        this.isActive = true;
        this.commonToasterService.showError(
          'Error',
          'Please choose another filed. This ' + value + ' is already set.'
        );
      }
    }
  }

  onSelectFile(event) {
    if (event.target.files.length > 0) {
      this.fileInfo = event.target.files[0];

      this.filesList.push(event.target.files[0]);
    }
  }

  remove(filesList): void {
    const index = this.filesList.indexOf(filesList);
    if (index >= 0) {
      this.filesList.splice(index, 1);
    }
    const file = document.querySelector('#customer_file') as HTMLInputElement;
    if (file) {
      file.value = null;
    }
  }

  moveToNext(tabName) {
    for (
      let i = 0;
      i < document.querySelectorAll('.mat-tab-label-content').length;
      i++
    ) {
      if (
        (<HTMLElement>document.querySelectorAll('.mat-tab-label-content')[i])
          .innerText == tabName
      ) {
        (<HTMLElement>document.querySelectorAll('.mat-tab-label')[i]).click();
      }
    }
    this.activeTab = true;
  }

  submitMapFields() {
    //console.log(this.fieldFrom);
    this.moveToNext('Preview');
  }

  mappingfield() {
    this.customerService.customerMappingfield().subscribe((res: any) => {
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

  finalImport() {
    this.customerService
      .submitImportCustomer({ successfileids: this.successfields, skipduplicate: this.skipduplicate })
      .subscribe((res: any) => {
        this.commonToasterService.showSuccess(
          'Data has been imported successfully.'
        );
        this.router.navigateByUrl('/masters/customer');
      });
  }

  importCustomer() {
    const formData = new FormData();
    formData.append('customer_file', this.fileInfo);
    formData.append('skipduplicate', this.importFile.skipduplicate);
    formData.append('map_key_value', JSON.stringify(this.mapFields));

    this.customerService.importCustomer(formData).subscribe((res: any) => {
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
          this.skipduplicate = res.data.skipduplicate;
        }
        this.stepper.next();
      } else {
      }
    });
  }
}
