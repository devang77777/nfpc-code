import { ValidatorService } from './../../../services/validator.service';
import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { computeDecimalDigest } from '@angular/compiler/src/i18n/digest';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-code-dialog',
  templateUrl: './code-dialog.component.html',
  styleUrls: ['./code-dialog.component.scss'],
})
export class CodeDialogComponent implements OnInit {
  radioTitle: string;
  showautogenerateIndex: boolean = false;
  autoGenerateFormGroup: FormGroup;
  showFooterOption: boolean = true;
  showdata: boolean = false;
  showSaveBtn: boolean = true;
  disabledInput: boolean = false;
  prefixCode: string = '';
  nextNumber: string = '';
  @Output() sendResponse: EventEmitter<any> = new EventEmitter<any>();
  radioItems: any[] = [
    {
      label: 'Continue auto-generating',
      key: 'autogenerate',
      checked: false,
    },
    {
      label: 'I will add them manually each time',
      key: 'manual',
      checked: false,
    },
  ];
  constructor(
    private commonToasterService: CommonToasterService,
    @Inject(MAT_DIALOG_DATA) public codeData: any,
    private dialog: MatDialogRef<CodeDialogComponent>,
    private apiService: ApiService
  ) { }
  codeSettingForm: FormGroup;

  ngOnInit(): void {
    this.autoGenerateFormGroup = new FormGroup({
      prefixCode: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      nextNumber: new FormControl('', [
        Validators.required,
        ValidatorService.numbersOnly,
        Validators.minLength(5),
        ValidatorService.maxLength(5),
      ]),
    });

    if (
      this.codeData.code == '' ||
      this.codeData.code == null ||
      this.codeData.code == undefined
    ) {
      this.showFooterOption = true;
    } else {
      this.showFooterOption = false;
      let code: string = '';
      code = this.codeData.code;
      let prefix = this.codeData.prefix;
      //console.log(prefix);
      let prefixCode = code.slice(0, prefix?.length ? prefix?.length : 3);
      let nextNumber = code.slice(prefix?.length ? prefix?.length : 3, code.length);
      this.autoGenerateFormGroup = new FormGroup({
        prefixCode: new FormControl(prefixCode, [
          Validators.required,
          Validators.minLength(3),
        ]),
        nextNumber: new FormControl(nextNumber, [
          Validators.required,
          ValidatorService.numbersOnly,
          Validators.minLength(5),
          ValidatorService.maxLength(5),
        ]),
      });
      this.autoGenerateFormGroup.controls.prefixCode.disable();
      this.autoGenerateFormGroup.controls.nextNumber.disable();
      this.disabledInput = true;
    }

    this.radioItems.forEach((item, i) => {
      if (this.codeData.key == item.key) {
        item.checked = true;
      }
      if (this.codeData.key == 'autogenerate') {
        this.showautogenerateIndex = true;
      } else {
        this.showSaveBtn = false;
        this.showautogenerateIndex = false;
      }
    });

    this.radioItems.forEach((item, i) => {
      if (item.key == 'autogenerate') {
        item.label = `Continue auto-generating ${this.codeData.title}`;
      }
    });
    if (!this.codeData.code) return;
    let code: string = '';
    code = this.codeData.code;
    this.prefixCode = code.slice(0, 5);
    this.nextNumber = code.slice(5, code.length);
    if (this.prefixCode.length) {
      this.showdata = true;
    } else {
      this.showdata = false;
    }
  }

  selectedResponse(option) {
    this.radioItems.forEach((item, i) => {
      item.checked = false;
    });
    option.checked = true;
    if (option.key == 'autogenerate') {
      this.showautogenerateIndex = true;
    } else {
      this.showSaveBtn = false;
      this.showautogenerateIndex = false;
    }
  }
  restrictLength(e) {
    if (e.target.value.length >= 5) {
      e.preventDefault();
    }
  }
  getCheckedOption() {
    let data: any;
    this.radioItems.forEach((item, i) => {
      if (item.checked == true) {
        data = item;
      }
    });
    return data;
  }

  checkOption(checkoptiontype: any) {
    if (checkoptiontype.key == 'manual') {
      let data = {
        type: 'manual',
        enableButton: true,
        data: '',
      };
      this.sendResponse.emit(data);
    } else if (checkoptiontype.key == 'autogenerate') {
      this.addCodeSetting();
    }
  }

  addCodeSetting() {
    const { prefixCode, nextNumber } = this.autoGenerateFormGroup.value;
    let data = {
      function_for: this.codeData.functionFor,
      is_code_auto: 1,
      prefix_code: this.autoGenerateFormGroup.value.prefixCode,
      start_code: this.autoGenerateFormGroup.value.nextNumber,
      is_final_update: 1,
    };
    this.apiService.addCodeSetting(data).subscribe((res: any) => {
      if (res.status) {
        let dataemit = {
          type: 'autogenerate',
          enableButton: false,
          data: res.data,
          reqData: data
        };
        this.sendResponse.emit(dataemit);
      } else if (!res.status) {
        let dataemit = {
          type: 'autogenerate',
          enableButton: false,
          data: res.data,
          reqData: data
        };
        this.sendResponse.emit(dataemit);
      }
      this.dialog.close(true);
    });
  }

  close() {
    this.dialog.close(false);
  }

  save() {
    let checkedData = this.getCheckedOption();
    if (checkedData.key == 'manual') {
      this.showSaveBtn = false;
      this.dialog.close(true);
    } else if (checkedData.key == 'autogenerate') {
      this.showSaveBtn = true;
      if (
        this.autoGenerateFormGroup.value.prefixCode.length &&
        this.autoGenerateFormGroup.value.nextNumber.length
      ) {
        this.showSaveBtn = false;
      } else {
        this.showSaveBtn = false;
        this.commonToasterService.showWarning(
          'Warning',
          'Please fill required fields.'
        );
        return;
      }
    }
    this.checkOption(checkedData);
  }
}
