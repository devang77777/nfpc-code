import { VendorData } from './../vendor-dt-page/vendor-dt-page.component';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { AnyARecord } from 'dns';

@Component({
  selector: 'app-add-vendor-form',
  templateUrl: './add-vendor-form.component.html',
  styleUrls: ['./add-vendor-form.component.scss'],
})
export class AddVendorFormComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  vendorFormGroup: FormGroup;
  vendorCodeFormControl: FormControl;
  firstNameFormControl: FormControl;
  lastNameFormControl: FormControl;
  companyNameFormControl: FormControl;
  emailFormControl: FormControl;
  mobileFormControl: FormControl;
  websiteFormControl: FormControl;
  address1FormControl: FormControl;
  address2FormControl: FormControl;
  cityFormControl: FormControl;
  stateFormControl: FormControl;
  zipcodeFormControl: FormControl;
  nextCommingNumberofVendorCode: string = '';
  public vendorData: VendorData;
  private subscriptions: Subscription[] = [];
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public isEdit: boolean;
  formPopulateData: any;
  nextCommingNumberofVendorCodePrefix: any;
  constructor(
    private route: ActivatedRoute,
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  ngOnInit(): void {
    this.buildForm();
    this.formPopulateData = this.route.snapshot.data[
      'vendor_resolve'
    ].itemAdd.data;
    const vendorCode = this.formPopulateData.code;
    this.loadFormData();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.vendorFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getNextComingCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;

          if (data && data.uuid && this.isEdit) {
            this.vendorCodeFormControl.setValue(data.vender_code);
            this.vendorCodeFormControl.disable();
            this.firstNameFormControl.setValue(data.firstname);
            this.lastNameFormControl.setValue(data.lastname);
            this.companyNameFormControl.setValue(data.company_name);
            this.emailFormControl.setValue(data.email);
            this.mobileFormControl.setValue(data.mobile);
            this.websiteFormControl.setValue(data.website);
            this.address1FormControl.setValue(data.address1);
            this.address2FormControl.setValue(data.address2);
            this.cityFormControl.setValue(data.city);
            this.stateFormControl.setValue(data.state);
            this.zipcodeFormControl.setValue(data.zip);
            this.vendorData = data;
            this.isEdit = true;
            //this.areaManagerContactFormControl.setValue(data.area_manager_contact);

            // this.categoryFormControl.setValue(data.van_category_id);
            this.vendorData = data;
            this.isEdit = true;
          }

          return;
        })
      );
    });
  }
  getNextComingCode() {
    let nextNumber = {
      function_for: 'vendor',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.setItemCode(res.data);
      }
    });
  }
  buildForm() {
    this.vendorCodeFormControl = new FormControl('', [Validators.required]);
    this.firstNameFormControl = new FormControl('', [Validators.required]);
    this.lastNameFormControl = new FormControl('', [Validators.required]);
    this.companyNameFormControl = new FormControl('', [Validators.required]);
    this.emailFormControl = new FormControl('', [Validators.required]);
    this.mobileFormControl = new FormControl('', [Validators.required]);
    this.websiteFormControl = new FormControl('');
    this.address1FormControl = new FormControl('', [Validators.required]);
    this.address2FormControl = new FormControl('');
    this.cityFormControl = new FormControl('', [Validators.required]);
    this.stateFormControl = new FormControl('', [Validators.required]);
    this.zipcodeFormControl = new FormControl('');

    this.vendorFormGroup = new FormGroup({
      vendorCode: this.vendorCodeFormControl,
      firstName: this.firstNameFormControl,
      lastName: this.lastNameFormControl,
      companyName: this.companyNameFormControl,
      email: this.emailFormControl,
      mobile: this.mobileFormControl,
      website: this.websiteFormControl,
      address1: this.address1FormControl,
      address2: this.address2FormControl,
      city: this.cityFormControl,
      state: this.stateFormControl,
      zipcode: this.zipcodeFormControl,
    });
    this.vendorCodeFormControl.disable();
  }
  setItemCode(code: any) {
    if (code.number_is !== null) {
      this.nextCommingNumberofVendorCode = code.number_is;
      this.nextCommingNumberofVendorCodePrefix = code.prefix_is;
      this.vendorCodeFormControl.setValue(this.nextCommingNumberofVendorCode);
      this.vendorCodeFormControl.disable();
    } else {
      this.nextCommingNumberofVendorCode = '';
      this.vendorCodeFormControl.enable();
    }
  }

  loadFormData() {
    const formData = this.formPopulateData;
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  saveVendorData() {
    if (this.vendorFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      this.editBankData();

      return;
    }

    this.postBankData();
  }
  private postBankData(): void {
    //console.log(this.vendorFormGroup.value);
    this.apiService
      .addVendorItem({
        vender_code: this.vendorCodeFormControl.value,
        firstname: this.firstNameFormControl.value,
        lastname: this.lastNameFormControl.value,
        email: this.emailFormControl.value,
        company_name: this.companyNameFormControl.value,
        mobile: this.mobileFormControl.value,
        website: this.websiteFormControl.value,
        address1: this.address1FormControl.value,
        address2: this.address2FormControl.value,
        city: this.cityFormControl.value,
        state: this.stateFormControl.value,
        zip: this.zipcodeFormControl.value,
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editBankData(): void {
    this.apiService
      .editVendoeItem(this.vendorData.uuid, {
        vender_code: this.vendorCodeFormControl.value,
        firstname: this.firstNameFormControl.value,
        lastname: this.lastNameFormControl.value,
        email: this.emailFormControl.value,
        company_name: this.companyNameFormControl.value,
        mobile: this.mobileFormControl.value,
        website: this.websiteFormControl.value,
        address1: this.address1FormControl.value,
        address2: this.address2FormControl.value,
        city: this.cityFormControl.value,
        state: this.stateFormControl.value,
        zip: this.zipcodeFormControl.value,
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
  public close() {
    this.fds.close();
    this.vendorFormGroup.reset();
    this.isEdit = false;
  }

  open() {
    let response: any;
    let data = {
      title: 'Vendor Code',
      functionFor: 'vendor',
      code: this.nextCommingNumberofVendorCode,
      prefix: this.nextCommingNumberofVendorCodePrefix,
      key: this.nextCommingNumberofVendorCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: 'auto',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.vendorCodeFormControl.setValue('');
          this.nextCommingNumberofVendorCode = '';
          this.vendorCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.nextCommingNumberofVendorCode =
            res.data.next_coming_number_vendor;
          this.vendorCodeFormControl.setValue(
            res.data.next_coming_number_vendor
          );
          this.nextCommingNumberofVendorCodePrefix = res.reqData.prefix_code;
          this.vendorCodeFormControl.disable();
        }
      });
  }
}
