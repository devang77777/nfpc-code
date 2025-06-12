import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-add-reason-form',
  templateUrl: './add-reason-form.component.html',
  styleUrls: ['./add-reason-form.component.scss']
})
export class AddReasonFormComponent implements OnInit {

  public reasonFormGroup: FormGroup;
  public reasonCodeFormControl: FormControl;
  public reasonNameFormControl: FormControl;
  public reasontypeFormControl: FormControl;
  public descriptionFormControl: FormControl;
  public reasondata: any;
  public reasonID: any;
  public formType: string;
  private isEdit: boolean;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  nextCommingNumberofreasonCode: string = ''
  private subscriptions: Subscription[] = [];
  depots: any;
  constructor(fds: FormDrawerService, apiService: ApiService, dataEditor: DataEditor, public dialog: MatDialog) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe(s => this.formType = s);
    this.reasonCodeFormControl = new FormControl('', [Validators.required]);
    this.reasonNameFormControl = new FormControl('', [Validators.required]);
    this.reasontypeFormControl = new FormControl('');
    this.descriptionFormControl = new FormControl('', [Validators.required]);
    this.getreasonCode();
    this.reasonFormGroup = new FormGroup({
      reasoncode: this.reasonCodeFormControl,
      reasonname: this.reasonNameFormControl,
      reasontype: this.reasontypeFormControl,
      description: this.descriptionFormControl
    });
    this.subscriptions.push(this.apiService.getReasonlist().subscribe((result: any) => {
      this.depots = result.data
    }));
    this.subscriptions.push(this.apiService.getReasonCategorylist().subscribe((result: any) => {
      this.reasonID = result.data;
    })
    );
    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      const data: any = result.data;
      if (data && data.uuid) {
        this.reasonNameFormControl.setValue(data.title);
        this.descriptionFormControl.setValue(data.description);
        this.reasontypeFormControl.setValue(data.reason_category_id);
        this.reasonCodeFormControl.setValue(data.code);
        this.reasondata = data;
        this.isEdit = true;
      }
      return;
    }));
  }
  getreasonCode() {
    let nextNumber = {
      "function_for": "reason"
    }
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofreasonCode = res.data.number_is;
        if (this.nextCommingNumberofreasonCode) {
          this.reasonCodeFormControl.setValue(this.nextCommingNumberofreasonCode);
          this.reasonCodeFormControl.disable();
        }
        else if (this.nextCommingNumberofreasonCode == null) {
          this.nextCommingNumberofreasonCode = '';
          this.reasonCodeFormControl.enable();
        }
      }
      else {
        this.nextCommingNumberofreasonCode = '';
        this.reasonCodeFormControl.enable();
      }
      //console.log("Res : ", res);
    });
  }
  public close() {
    this.fds.close();
    this.reasonFormGroup.reset();
    this.isEdit = false;
  }

  public saveReasonData(): void {
    if (this.reasonFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editReasonData();
      return;
    }
    this.postReasonData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postReasonData(): void {
    this.apiService.addReasonItem({
      code: this.reasonCodeFormControl.value,
      title: this.reasonNameFormControl.value,
      description: this.descriptionFormControl.value,
      reason_category_id: this.reasontypeFormControl.value,
      status: "1"
    }).subscribe((result: any) => {
      this.fds.close().then(success => {
        window.location.reload();
      });
    });
  }

  private editReasonData(): void {
    this.apiService.editReasonItem(this.reasondata.uuid, {
      code: this.reasonCodeFormControl.value,
      title: this.reasonNameFormControl.value,
      description: this.descriptionFormControl.value,
      reason_category_id: this.reasontypeFormControl.value,
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
      title: 'Reason Code',
      functionFor: 'reason',
      code: this.nextCommingNumberofreasonCode,
      key: this.nextCommingNumberofreasonCode.length ? 'autogenerate' : 'manual'
    };
    this.dialog.open(CodeDialogComponent, {
      width: '500px',
      height: 'auto',
      data: data
    }).componentInstance
      .sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.reasonCodeFormControl.setValue('');
          this.reasonCodeFormControl.enable();
        }
        else if (res.type == 'autogenerate' && !res.enableButton) {
          this.reasonCodeFormControl.setValue(res.data.next_coming_number_reason);
          this.nextCommingNumberofreasonCode = res.reqData.prefix_code;
          this.reasonCodeFormControl.disable();
        }
      });
  }
}
