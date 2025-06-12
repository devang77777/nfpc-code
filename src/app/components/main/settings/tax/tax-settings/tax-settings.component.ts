import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tax-settings',
  templateUrl: './tax-settings.component.html',
  styleUrls: ['./tax-settings.component.scss']
})
export class TaxSettingsComponent implements OnInit {

  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public taxSettingFormGroup;

  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  public items: any[] = [];
  private subscriptions: Subscription[] = [];
  destributionData = [];
  taxSettingData: any;

  constructor(
    private fb: FormBuilder,
    fds: FormDrawerService,
    public apiService: ApiService,
    dataEditor: DataEditor,
    private router: Router
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }
  public ngOnInit(): void {
    this.taxSettingFormGroup = this.fb.group({
      isVat: ['0'],
      TRN_text: [''],
      number: [''],
      internationalTrade: [''],
      vatRegisteredOn: [''],
    });
    this.subscriptions.push(this.apiService.getTaxSetting().subscribe(result => {
      if (result.status == true) {
        const data: any = result.data;
        if (data && data.uuid) {
          this.taxSettingFormGroup.patchValue({
            isVat: data.is_tax_registered.toString(),
            TRN_text: data.trn_text,
            number: data.number,
            internationalTrade: data.international_trade.toString(),
            vatRegisteredOn: data.register_date,
          })
          this.taxSettingData = data;
          this.isEdit = true;
        }
        this.onChnageVat(data.is_tax_registered.toString());
      }
      return;
    }));
  }

  onChnageVat(value) {
    if (value == '1') {
      this.taxSettingFormGroup.controls['TRN_text'].setErrors({ required: true });
      this.taxSettingFormGroup.controls['number'].setErrors({ required: true });
      this.taxSettingFormGroup.controls['vatRegisteredOn'].setErrors({ required: true });
    } else {
      this.taxSettingFormGroup.controls['TRN_text'].setErrors(null);
      this.taxSettingFormGroup.controls['number'].setErrors(null);
      this.taxSettingFormGroup.controls['vatRegisteredOn'].setErrors(null);
    }
  }

  public saveTaxSettingData() {
    if (this.taxSettingFormGroup.invalid) {
      return false;
    }
    let form = this.taxSettingFormGroup.value;
    let sForm = {
      is_tax_registered: form.isVat,
      trn_text: form.TRN_text,
      number: form.number,
      international_trade: form.internationalTrade,
      register_date: form.vatRegisteredOn,
      status: 1,
    };

    // if (this.isEdit) {
    //   this.editTaxSettingData(sForm);
    //   return;
    // }

    this.postTaxSettingData(sForm);

  }

  postTaxSettingData(sForm) {
    this.subscriptions.push(
      this.apiService.addTaxSetting(sForm).subscribe((res) => {

      })
    );
  }

  editTaxSettingData(sForm) {
    this.subscriptions.push(
      this.apiService.editTaxSetting(this.taxSettingData.uuid, sForm).subscribe((res) => {
      })
    );
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
