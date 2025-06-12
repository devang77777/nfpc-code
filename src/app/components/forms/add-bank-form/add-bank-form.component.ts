import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';

@Component({
  selector: 'app-add-bank-form',
  templateUrl: './add-bank-form.component.html',
  styleUrls: ['./add-bank-form.component.scss']
})
export class AddBankFormComponent implements OnInit {

  public bankFormGroup: FormGroup;
  public accountnumberFormControl: FormControl;
  public bankCodeFormControl: FormControl;
  public bankNameFormControl: FormControl;
  public addressFormControl: FormControl;
  nextCommingNumberofBankCode: string = '';

  public formType: string;

  private isEdit: boolean;
  private bankData: any;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  depots: any;
  constructor(fds: FormDrawerService, apiService: ApiService, dataEditor: DataEditor, public dialog: MatDialog) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    // this.fds.formType.subscribe(s => this.formType = s);
    this.fds.formType.subscribe(s => {
      this.formType = s
      if (this.bankFormGroup) {
        this.bankFormGroup.reset();
      }
      if (this.formType != 'Edit') {
        this.getBankCode()
        this.isEdit = false;
      }
      else {
        this.isEdit = true;
      }
    });
    this.accountnumberFormControl = new FormControl('', [Validators.required]);
    this.bankCodeFormControl = new FormControl('', [Validators.required]);
    this.bankNameFormControl = new FormControl('', [Validators.required]);
    this.addressFormControl = new FormControl('', [Validators.required]);
    // this.areaManagerContactFormControl = new FormControl('', [Validators.required]);
    this.bankFormGroup = new FormGroup({
      bankcode: this.bankCodeFormControl,
      bankname: this.bankNameFormControl,
      accountnumber: this.accountnumberFormControl,
      address: this.addressFormControl



    });
    this.bankCodeFormControl.disable();
    this.subscriptions.push(this.apiService.getBanklist().subscribe((result: any) => {
      this.depots = result.data;
      //console.log(this.depots);

    }));
    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      const data: any = result.data;
      if (data && data.uuid && this.isEdit) {
        this.accountnumberFormControl.setValue(data.account_number);
        this.bankCodeFormControl.setValue(data.bank_code);
        this.bankCodeFormControl.disable()
        this.bankNameFormControl.setValue(data.bank_name);
        this.addressFormControl.setValue(data.bank_address);
        //this.areaManagerContactFormControl.setValue(data.area_manager_contact);

        // this.categoryFormControl.setValue(data.van_category_id);
        this.bankData = data;
        this.isEdit = true;
      }
      return;
    }));
  }
  getBankCode() {
    let nextNumber = {
      "function_for": "bank_information"
    }
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofBankCode = res.data.number_is;
        if (this.nextCommingNumberofBankCode) {
          this.bankCodeFormControl.setValue(this.nextCommingNumberofBankCode);
          this.bankCodeFormControl.disable();
        }
        else if (this.nextCommingNumberofBankCode == null) {
          this.nextCommingNumberofBankCode = '';
          this.bankCodeFormControl.enable();
        }
      }
      else {
        this.nextCommingNumberofBankCode = '';
        this.bankCodeFormControl.enable();
      }
      //console.log("Res : ", res);
    });
  }
  public close() {
    this.fds.close();
    this.bankFormGroup.reset();
    this.isEdit = false;
  }

  public saveBankData(): void {
    if (this.bankFormGroup.invalid) {

      return;
    }

    if (this.isEdit) {
      this.editBankData();

      return;
    }

    this.postBankData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postBankData(): void {

    //console.log(this.bankFormGroup.value);
    this.apiService.addBankItem({
      account_number: this.accountnumberFormControl.value,
      bank_code: this.bankCodeFormControl.value,
      bank_name: this.bankNameFormControl.value,
      bank_address: this.addressFormControl.value,
      status: "1"
    }).subscribe((result: any) => {
      this.fds.close().then(success => {
        window.location.reload();
      });
    });
  }

  private editBankData(): void {

    this.apiService.editBankItem(this.bankData.uuid, {
      account_number: this.accountnumberFormControl.value,
      bank_code: this.bankCodeFormControl.value,
      bank_name: this.bankNameFormControl.value,
      bank_address: this.addressFormControl.value,
      status: "1"
    }).subscribe((result: any) => {
      this.isEdit = false;
      this.fds.close().then(success => {
        window.location.reload();
      });
    });
  }
  open() {
    let response: any;
    let data = {
      title: 'Bank Code',
      functionFor: 'bank_information',
      code: this.bankCodeFormControl.value,
      key: this.nextCommingNumberofBankCode.length ? 'autogenerate' : 'manual'
    };

    this.dialog.open(CodeDialogComponent, {
      width: '500px',
      height: '340px',
      data: data
    }).componentInstance
      .sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.bankCodeFormControl.setValue('');
          this.bankCodeFormControl.enable();
        }
        else if (res.type == 'autogenerate' && !res.enableButton) {
          this.bankCodeFormControl.setValue(res.data.next_coming_number_bank_information);
          this.nextCommingNumberofBankCode = res.reqData.prefix_code;
          this.bankCodeFormControl.disable();
        }
      })
  }
}
