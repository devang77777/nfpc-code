import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
// import { Country } from 'src/app/components/datatables/country-dt/country-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { Country } from '../country-dt/country-dt.component';
import { CustomFieldFormComponent } from 'src/app/features/shared/custom-field-form/custom-field-form.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { APP } from 'src/app/app.constant';

export interface CustomFormData {
  checkboxDefaultValue: string;
  dataType: string;
  dateDefaultValue: string;
  dropdownOptions: string[];
  labelName: string;
  textboxDefaultValue: string;
}
@Component({
  selector: 'app-add-country-form',
  templateUrl: './add-country-form.component.html',
  styleUrls: ['./add-country-form.component.scss'],
})
export class AddCountryFormComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  // custom fields
  data;
  currentDataType;
  public customFormGroup: FormGroup;
  public customFieldArray: FormArray;
  formdata: CustomFormData[] = [];
  isCustomField = false;
  editData = [];
  public countryFormGroup: FormGroup;
  public nameFormControl: FormControl;
  public countryCodeFormControl: FormControl;
  public dialCodeFormControl: FormControl;
  public currencyFormControl: FormControl;
  public currencyCodeFormControl: FormControl;
  public currencySymbolFormControl: FormControl;
  public formType: string;
  moduleId = APP.MODULE.COUNTRY;
  private isEdit: boolean;
  private countryData: Country;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private matDialog: MatDialog;
  customFields: Array<any> = [];
  private subscriptions: Subscription[] = [];
  nextCommingNumberofcountryCode: string = '';
  private toaster: CommonToasterService;
  nextCommingNumberofcountryCodePrefix: any;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    matDialog: MatDialog,
    toaster: CommonToasterService
  ) {
    Object.assign(this, { fds, apiService, dataEditor, matDialog, toaster });
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.countryFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getcountryCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;

          if (data && data.uuid && this.isEdit) {
            this.editData = result.data.custom_field_value_save;
            this.nameFormControl.setValue(data.name);
            this.countryCodeFormControl.setValue(data.country_code);
            this.countryCodeFormControl.disable();
            this.dialCodeFormControl.setValue(data.dial_code);
            this.currencyFormControl.setValue(data.currency);
            this.currencyCodeFormControl.setValue(data.currency_code);
            this.currencySymbolFormControl.setValue(data.currency_symbol);
            this.countryData = data;
            this.isEdit = true;
          }

          return;
        })
      );
    });
    this.nameFormControl = new FormControl('', [Validators.required]);
    this.countryCodeFormControl = new FormControl('', [Validators.required]);
    this.dialCodeFormControl = new FormControl('');
    this.currencyFormControl = new FormControl('', [Validators.required]);
    this.currencyCodeFormControl = new FormControl('');
    this.currencySymbolFormControl = new FormControl('', [Validators.required]);

    this.countryFormGroup = new FormGroup({
      name: this.nameFormControl,
      countryCode: this.countryCodeFormControl,
      dialCode: this.dialCodeFormControl,
      currency: this.currencyFormControl,
      currencyCode: this.currencyCodeFormControl,
      currencySymbol: this.currencySymbolFormControl,
    });
    this.countryCodeFormControl.disable();
    this.getCustomFieldStatus();
  }
  getcountryCode() {
    let nextNumber = {
      function_for: 'country',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofcountryCode = res.data.number_is;
        this.nextCommingNumberofcountryCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofcountryCode) {
          this.countryCodeFormControl.setValue(
            this.nextCommingNumberofcountryCode
          );
          this.countryCodeFormControl.disable();
        } else if (this.nextCommingNumberofcountryCode == null) {
          this.nextCommingNumberofcountryCode = '';
          this.countryCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofcountryCode = '';
        this.countryCodeFormControl.enable();
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
    this.countryFormGroup.reset();
    this.isEdit = false;
  }

  public saveCountryData(): void {
    if (this.countryFormGroup.invalid) {
      Object.keys(this.countryFormGroup.controls).forEach((key) => {
        this.countryFormGroup.controls[key].markAsDirty();
      });
      return;
    }
    if (this.isEdit) {
      this.editCountryData();

      return;
    }
    this.postCountryData();
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }
  public postCountryData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;
    this.apiService
      .addCountry({
        name: this.nameFormControl.value,
        country_code: this.countryCodeFormControl.value,
        dial_code: this.dialCodeFormControl.value,
        currency: this.currencyFormControl.value,
        currency_code: this.currencyCodeFormControl.value,
        currency_symbol: this.currencySymbolFormControl.value,
        status: 1,
        modules,
      })
      .subscribe(
        (result: any) => {
          this.toaster.showSuccess(
            'Success',
            'Country has been added successfully.'
          );
          let data = result.data;
          data.edit = false;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => {
          // alert(err.error.message);
        }
      );
  }
  camelToSnakeCase = (data) => {
    let mapped = {};
    Object.keys(data).forEach((key, index) => {
      const converted = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      mapped[converted] = data[key];
    });
    return mapped;
  };
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
  private editCountryData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .editCountry(this.countryData.uuid, {
        name: this.nameFormControl.value,
        country_code: this.countryCodeFormControl.value,
        dial_code: this.dialCodeFormControl.value,
        currency: this.currencyFormControl.value,
        currency_code: this.currencyCodeFormControl.value,
        currency_symbol: this.currencySymbolFormControl.value,
        status: 1,
        modules,
      })
      .subscribe(
        (result: any) => {
          this.isEdit = false;
          this.toaster.showSuccess(
            'Success',
            'Country has been updated successfully.'
          );
          let data = result.data;
          data.edit = true;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => {
          // alert(err.error.message);
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
      title: 'Country Code',
      functionFor: 'country',
      code: this.nextCommingNumberofcountryCode,
      prefix: this.nextCommingNumberofcountryCodePrefix,
      key: this.nextCommingNumberofcountryCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.matDialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '340px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.countryCodeFormControl.setValue('');
          this.nextCommingNumberofcountryCode = '';
          this.countryCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.countryCodeFormControl.setValue(
            res.data.next_coming_number_country
          );
          this.nextCommingNumberofcountryCode =
            res.data.next_coming_number_country;
          this.nextCommingNumberofcountryCodePrefix = res.reqData.prefix_code;
          this.countryCodeFormControl.disable();
        }
      });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
