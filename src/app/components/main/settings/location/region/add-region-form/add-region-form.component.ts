import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import {
  FormGroup,
  FormBuilder,
  NgControl,
  FormControl,
  Validators,
} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { TitleCasePipe } from '@angular/common';
// import { RegionMaster } from '../../datatables/region-master-dt/region-master-dt.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { RegionMaster } from '../region-master-dt/region-master-dt.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { APP } from 'src/app/app.constant';
import { MasterService } from 'src/app/components/main/master/master.service';
// import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';

@Component({
  selector: 'app-add-region-form',
  templateUrl: './add-region-form.component.html',
  styleUrls: ['./add-region-form.component.scss'],
})
export class AddRegionFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public regionFormGroup: FormGroup;
  public countryIdFormControl: FormControl;
  public regionCodeFormControl: FormControl;
  public regionNameFormControl: FormControl;
  public countries = [];
  editData = [];
  public formType: string;
  nextCommingNumberofRegionCode: string = '';
  nextCommingNumberofRegionCodePrefix: string = '';
  private isEdit: boolean;
  private regionData: RegionMaster;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;

  private subscriptions: Subscription[] = [];
  isCustomField = false;
  private toaster: CommonToasterService;
  moduleId = APP.MODULE.REGION;
  customFields: Array<any> = [];
  org_data = JSON.parse(localStorage.getItem('organization')) !== 'null' ? JSON.parse(localStorage.getItem('organization')) : {};

  constructor(
    fds: FormDrawerService,
    toaster: CommonToasterService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private masterService: MasterService
  ) {
    Object.assign(this, { fds, apiService, toaster, dataEditor });
  }

  public ngOnInit(): void {
    //console.log(this.countryIdFormControl);
    this.getCustomFieldStatus();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.regionFormGroup?.reset();
      this.countryIdFormControl = new FormControl(this.org_data?.org_country_id, [Validators.required]);
      this.regionCodeFormControl = new FormControl('', [Validators.required]);
      this.regionNameFormControl = new FormControl('', [Validators.required]);
      this.regionFormGroup = new FormGroup({
        countryId: this.countryIdFormControl,
        regionCode: this.regionCodeFormControl,
        regionName: this.regionNameFormControl,
      });
      this.regionCodeFormControl.disable();
      if (this.formType != 'Edit') {
        this.getregionCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.editData = result.data.custom_field_value_save;
            //this.countryIdFormControl.setValue(data.country_id);
            this.regionCodeFormControl.setValue(data.region_code);
            this.regionCodeFormControl.disable();
            this.regionNameFormControl.setValue(data.region_name);
            this.regionData = data;
            this.isEdit = true;
          }
          return;
        })
      );
    });

    const dataCollectionObj = {
      "list_data": ["country"],
      "function_for": "region"
    };
    this.subscriptions.push(
      this.masterService.masterList(dataCollectionObj).subscribe((result: any) => {
        this.countries.push(result.data.country);
      })
    );
  }
  getregionCode() {
    let nextNumber = {
      function_for: 'region',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofRegionCode = res.data.number_is;
        this.nextCommingNumberofRegionCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofRegionCode) {
          this.regionCodeFormControl.setValue(
            this.nextCommingNumberofRegionCode
          );
          this.regionCodeFormControl.disable();
        } else if (this.nextCommingNumberofRegionCode == null) {
          this.nextCommingNumberofRegionCode = '';
          this.regionCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofRegionCode = '';
        this.regionCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }

  getCustomFieldStatus() {
    this.apiService
      .checkCustomFieldStatus({
        organisation_id: APP.ORGANIZATION,
        module_id: this.moduleId,
      })
      .subscribe((response) => {
        this.isCustomField =
          response.data.custom_field_status == 0 ? false : true;
      });
  }
  public close() {
    this.fds.close();
    this.regionFormGroup.reset();
    this.isEdit = false;
  }

  public saveRegionData(): void {
    if (this.regionFormGroup.invalid) {
      Object.keys(this.regionFormGroup.controls).forEach((key) => {
        this.regionFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEdit) {
      this.editRegionData();
      return;
    }

    this.postRegionData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }
  validateCustomFields() {
    let isValid;
    const modules = this.customFields.map((item) => {
      const value =
        item.fieldType == 'multi_select'
          ? item.fieldValue.toString()
          : item.fieldValue;
      return {
        module_id: item.moduleId,
        custom_field_id: item.id,
        custom_field_value: value,
      };
    });
    isValid = modules.find(
      (module) =>
        module.custom_field_value === undefined ||
        module.custom_field_value === ''
    );
    if (isValid) {
      this.toaster.showWarning('Warning', 'Please fill all custom fields.');
      return false;
    }
    return modules;
  }
  private postRegionData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .addRegion({
        country_id: this.countryIdFormControl.value,
        region_code: this.regionCodeFormControl.value,
        region_name: this.regionNameFormControl.value,
        region_status: '1',
        modules,
      })
      .subscribe(
        (result: any) => {
          let data = result.data;
          data.edit = false;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => {
          this.toaster.showError('Error', err.error.message);
        }
      );
  }

  private editRegionData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .editRegion(this.regionData.uuid, {
        country_id: this.countryIdFormControl.value,
        region_code: this.regionCodeFormControl.value,
        region_name: this.regionNameFormControl.value,
        region_status: '1',
        modules,
      })
      .subscribe(
        (result: any) => {
          this.isEdit = false;
          let data = result.data;
          data.edit = true;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => {
          this.toaster.showError('Error', err.error.message);
        }
      );
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  open() {
    let response: any;
    let data = {
      title: 'Region Code',
      functionFor: 'region',
      code: this.nextCommingNumberofRegionCode,
      prefix: this.nextCommingNumberofRegionCodePrefix,
      key: this.nextCommingNumberofRegionCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '340px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.regionCodeFormControl.setValue('');
          this.nextCommingNumberofRegionCode = '';
          this.regionCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.regionCodeFormControl.setValue(
            res.data.next_coming_number_region
          );
          this.nextCommingNumberofRegionCode =
            res.data.next_coming_number_region;
          this.nextCommingNumberofRegionCodePrefix = res.reqData.prefix_code;
          this.regionCodeFormControl.disable();
        }
      });
  }
}

//   regionForm: FormGroup;
//   countries: any[];
//   constructor(
//     private fds: FormDrawerService,
//     private apiService: ApiService,
//     private formBuilder: FormBuilder,
//     public titleCase: TitleCasePipe
//   ) { }
//   ngOnInit(): void {
//     this.regionForm = this.formBuilder.group({
//       // organisation_id: [],
//       country_id: [''],
//       region_code: [''],
//       region_name: [''],
//       region_status: ['1']
//     })
//     this.getCountries();
//   }
//   getCountries() {
//     this.apiService.getAllCountries().subscribe((res: any) => {
//       this.countries = res.data;
//     })
//   }
//   onSubmit() {
//     this.regionForm.patchValue({region_name: this.titleCase.transform(this.regionForm.value.region_name)} );
//     this.apiService.addRegion(JSON.stringify(this.regionForm.value)).subscribe(res =>{
//       //console.log(res);
//       window.location.reload();
//     })

//   }
//   close() {
//     this.fds.close()
//   }

// }
