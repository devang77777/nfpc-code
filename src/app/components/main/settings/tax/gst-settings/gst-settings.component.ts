import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gst-settings',
  templateUrl: './gst-settings.component.html',
  styleUrls: ['./gst-settings.component.scss']
})
export class GstSettingsComponent implements OnInit {

  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public gstSettingFormGroup;

  private isEdit: boolean;
  public formType: string;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  public items: any[] = [];
  private subscriptions: Subscription[] = [];
  destributionData = [];
  gstSettingData: any;

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
    this.gstSettingFormGroup = this.fb.group({
      isGst: ['0'],
      GSTIN: [''],
      compositionScheme: [''],
      compositionSchemePercentage: [''],
      digitalServices: [''],
      reverseCharge: [''],
      vatRegisteredOn: [''],
    });
    this.subscriptions.push(this.apiService.getTaxSetting().subscribe(result => {
      if (result.status == true) {
        const data: any = result.data;
        if (data && data.uuid) {
          this.gstSettingFormGroup.patchValue({
            isGst: data.is_tax_registered.toString(),
            GSTIN: data.number,
            compositionScheme: data?.composition_scheme?.toString(),
            compositionSchemePercentage: data.composition_scheme_percentage.toString(),
            digitalServices: data?.digital_services?.toString(),
            reverseCharge: data?.reverse_charge?.toString(),
            vatRegisteredOn: data.register_date,
          })
          this.gstSettingData = data;
          this.isEdit = true;
        }
        this.onChnageVat(data.is_tax_registered.toString());
      }
      return;
    }));
  }

  onChnageVat(value) {
    if (value == '1') {
      this.gstSettingFormGroup.controls['GSTIN'].setErrors({ required: true });
    } else {
      this.gstSettingFormGroup.controls['GSTIN'].setErrors(null);
    }
  }

  public saveGstSettingData() {
    if (this.gstSettingFormGroup.invalid) {
      return false;
    }
    let form = this.gstSettingFormGroup.value;
    let sForm = {
      is_tax_registered: form.isGst,
      composition_scheme: form.compositionScheme,
      digital_services: form.digitalServices,
      composition_scheme_percentage: form.compositionSchemePercentage,
      reverse_charege: form.reverseCharge,
      number: form.GSTIN,
      register_date: form.vatRegisteredOn,
      status: 1,
    };

    // if (this.isEdit) {
    //   this.editgstSettingData(sForm);
    //   return;
    // }

    this.postGstSettingData(sForm);

  }

  postGstSettingData(sForm) {
    this.subscriptions.push(
      this.apiService.addTaxSetting(sForm).subscribe((res) => {

      })
    );
  }

  editgstSettingData(sForm) {
    this.subscriptions.push(
      this.apiService.editTaxSetting(this.gstSettingData.uuid, sForm).subscribe((res) => {
      })
    );
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
