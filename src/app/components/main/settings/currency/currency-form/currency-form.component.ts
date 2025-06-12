import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegionMaster } from '../../location/region/region-master-dt/region-master-dt.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { map, startWith } from 'rxjs/operators';
import { APP } from 'src/app/app.constant';

@Component({
  selector: 'app-currency-form',
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.scss']
})
export class CurrencyFormComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public currencyFormGroup: FormGroup;
  public currencyCodeFormControl: FormControl;
  public currencySymbolFormControl: FormControl;
  public currencyNameFormControl: FormControl;
  public decimalPlaceFormControl: FormControl;
  public currencyFormatFormControl: FormControl;
  public selectedCurrency;
  public selectedCurrencyName;
  public currencies: any = [];
  public filteredCurrencies;
  public formType: string;
  public isEdit: boolean;
  private currencyData;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  customFields: Array<any> = [];
  moduleId = APP.MODULE.CURRENCY;
  isCustomField = false;
  editData = [];

  decimals = [
    '0',
    '2',
    '3'
  ];

  formats = [
    { decimal_id: '0', value: '1,234,567' },
    { decimal_id: '0', value: '1.234.567' },
    { decimal_id: '0', value: '1 234 567' },
    { decimal_id: '2', value: '1,234,567.89' },
    { decimal_id: '2', value: '1.234.567,89' },
    { decimal_id: '2', value: '1 234 567,89' },
    { decimal_id: '3', value: '1,234,567.899' },
    { decimal_id: '3', value: '1.234.567,899' },
    { decimal_id: '3', value: '1 234 567,899' },
  ];

  formats_by_decimal = [];

  constructor(fds: FormDrawerService, apiService: ApiService, dataEditor: DataEditor, public dialog: MatDialogModule) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe(s => {
      this.formType = s
      this.currencyFormGroup?.reset();
      this.selectedCurrency = undefined;
      if (this.formType != 'Edit') {
        this.isEdit = false;
      }
      else {
        this.isEdit = true;
      }
      this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
        const data: any = result.data;
        this.currencyData = result.data;
        if (data && data.id && this.isEdit) {
          this.selectedCurrencyName = data.currency_master.name;
          this.onCurrencyCodeChange(data);
          this.currencyCodeFormControl.setValue(data.code);
          this.currencyNameFormControl.setValue(data.name);
          this.currencySymbolFormControl.setValue(data.symbol);
          this.decimalPlaceFormControl.setValue(data.decimal_digits);
          this.getFormatsByDecimal(data.decimal_digits);
          this.currencyFormatFormControl.setValue(data.format);
          this.currencyData = data;
          this.isEdit = true;
        }
        return;
      }));
    });

    this.currencyCodeFormControl = new FormControl('');
    this.currencySymbolFormControl = new FormControl('', [Validators.required]);
    this.currencyNameFormControl = new FormControl('', [Validators.required]);
    this.decimalPlaceFormControl = new FormControl('');
    this.currencyFormatFormControl = new FormControl('');
    this.currencyFormGroup = new FormGroup({
      currencyCode: this.currencyCodeFormControl,
      currencySymbol: this.currencySymbolFormControl,
      currencyName: this.currencyNameFormControl,
      currencyFormat: this.currencyFormatFormControl,
      decimalPlace: this.decimalPlaceFormControl
    });
    // this.currencyCodeFormControl.disable();
    this.subscriptions.push(this.apiService.getAllCurrencyCode().subscribe((result: any) => {
      this.currencies = result.data;
    }));

    // this.subscriptions.push(this.currencyCodeFormControl.valueChanges.pipe(
    //   startWith<string | Currency>(''),
    //   map(value => typeof value === 'string' ? value : value.name),
    //   map((value: string) => {
    //     return value.length ? this.filterCurrency(value) : this.currencies.slice();
    //   })
    // ).subscribe(value => {
    //   this.filteredCurrencies = value;
    // }));

  }
  private filterCurrency(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.currencies.filter(currency => currency.name?.toLowerCase().includes(filterValue));
  }
  public close() {
    this.fds.close();
    this.currencyFormGroup.reset();
    this.isEdit = false;
  }
  public onCurrencyCodeChange(event) {
    this.selectedCurrency = event;
    this.currencySymbolFormControl.setValue(this.selectedCurrency.symbol);
    this.currencyNameFormControl.setValue(this.selectedCurrency.name);
    this.decimalPlaceFormControl.setValue(this.selectedCurrency.decimal_digits);
    this.getFormatsByDecimal(this.selectedCurrency.decimal_digits);
    this.currencyFormatFormControl.setValue(this.formats_by_decimal[0].value);


  }

  public getFormatsByDecimal(event) {
    this.formats_by_decimal = [];
    this.formats_by_decimal = this.formats.filter(format => format.decimal_id == event);
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
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }
  public saveCurrencyData(): void {
    if (this.currencyFormGroup.invalid) {
      Object.keys(this.currencyFormGroup.controls).forEach(key => {
        this.currencyFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEdit) {
      this.editCurrencyData();
      return;
    }

    this.postCurrencyData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postCurrencyData(): void {

    this.apiService.addCurrency({
      "currency_master_id": this.selectedCurrency.id,
      "name": this.currencyNameFormControl.value,
      "symbol": this.currencySymbolFormControl.value,
      "code": this.selectedCurrency.code,
      "name_plural": this.selectedCurrency.name_plural,
      "symbol_native": this.selectedCurrency.symbol_native,
      "decimal_digits": this.decimalPlaceFormControl.value,
      "rounding": this.selectedCurrency.rounding,
      "default_currency": 0,
      "format": this.currencyFormatFormControl.value
    }).subscribe((result: any) => {
      let data = result.data;
      data.edit = false;
      this.updateTableData.emit(data);
      this.fds.close();
    });
  }

  private editCurrencyData(): void {
    this.apiService.editCurrency(this.currencyData.id, {
      "currency_master_id": this.selectedCurrency.id,
      "name": this.currencyNameFormControl.value,
      "symbol": this.currencySymbolFormControl.value,
      "code": this.selectedCurrency.code,
      "name_plural": this.selectedCurrency.name_plural,
      "symbol_native": this.selectedCurrency.symbol_native,
      "decimal_digits": this.decimalPlaceFormControl.value,
      "rounding": this.selectedCurrency.rounding,
      "default_currency": this.currencyData?.default_currency,
      "format": this.currencyFormatFormControl.value
    }).subscribe((result: any) => {
      this.isEdit = false;
      let data = result.data;
      data.edit = true;
      this.updateTableData.emit(data);
      this.fds.close();
    }, err => {
      alert(err.error.message);
    });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }

}
export interface Currency {
  "id": number,
  "uuid": string,
  "organisation_id": number,
  "currency_master_id": number,
  "name": string,
  "symbol": string,
  "code": string,
  "name_plural": string,
  "symbol_native": string,
  "decimal_digits": number,
  "rounding": number,
  "default_currency": number,
  "format": string
}