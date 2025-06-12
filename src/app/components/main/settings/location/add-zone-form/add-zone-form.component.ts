import { Component, OnInit, OnDestroy, EventEmitter, Output, } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { APP } from 'src/app/app.constant';
import { MasterService } from 'src/app/components/main/master/master.service';
import { ZoneMasterDtComponent } from '../zone/zone-master-dt/zone-master-dt.component';

@Component({
  selector: 'app-add-zone-form',
  templateUrl: './add-zone-form.component.html',
  styleUrls: ['./add-zone-form.component.scss']
})
export class AddZoneFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public zoneFormGroup: FormGroup;
  // public zoneCodeFormControl: FormControl;
  public zoneNameFormControl: FormControl;
  editData = [];
  public formType: string;
  nextCommingNumberofZoneCode = '';
  nextCommingNumberofZoneCodePrefix = '';
  private isEdit: boolean;
  private zoneData: ZoneMasterDtComponent;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;

  private subscriptions: Subscription[] = [];
  isCustomField = false;
  private toaster: CommonToasterService;
  moduleId = APP.MODULE.ZONE;
  customFields: Array<any> = [];

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
    // console.log(this.countryIdFormControl);
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.zoneFormGroup?.reset();
      // this.zoneCodeFormControl = new FormControl('', [Validators.required]);
      this.zoneNameFormControl = new FormControl('', [Validators.required]);
      this.zoneFormGroup = new FormGroup({
        // zoneCode: this.zoneCodeFormControl,
        zoneName: this.zoneNameFormControl,
      });
      // this.zoneCodeFormControl.disable();
      if (this.formType != 'Edit') {
        this.getzoneCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.editData = result.data.custom_field_value_save;
            // this.zoneCodeFormControl.setValue(data.zone_code);
            // this.zoneCodeFormControl.disable();
            this.zoneNameFormControl.setValue(data.zone_name);
            this.zoneData = data;
            this.isEdit = true;
          }
          return;
        })
      );
    });

  }
  getzoneCode() {
    // const nextNumber = {
    //   function_for: 'zone',
    // };
    // this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
    //   if (res.status) {
    //     this.nextCommingNumberofZoneCode = res.data.number_is;
    //     this.nextCommingNumberofZoneCodePrefix = res.data.prefix_is;
    //     if (this.nextCommingNumberofZoneCode) {
    //       this.zoneCodeFormControl.setValue(
    //         this.nextCommingNumberofZoneCode
    //       );
    //       this.zoneCodeFormControl.disable();
    //     } else if (this.nextCommingNumberofZoneCode == null) {
    //       this.nextCommingNumberofZoneCode = '';
    //       this.zoneCodeFormControl.enable();
    //     }
    //   } else {
    //     this.nextCommingNumberofZoneCode = '';
    //     this.zoneCodeFormControl.enable();
    //   }
    //   // console.log('Res : ', res);
    // });
  }
  public close() {
    this.fds.close();
    this.zoneFormGroup.reset();
    this.isEdit = false;
  }

  public saveZoneData(): void {
    if (this.zoneFormGroup.invalid) {
      Object.keys(this.zoneFormGroup.controls).forEach((key) => {
        this.zoneFormGroup.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEdit) {
      this.editZoneData();
      return;
    }

    this.postZoneData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }

  private postZoneData(): void {

    this.apiService
      .addZone({
        // zone_code: this.zoneCodeFormControl.value,
        name: this.zoneNameFormControl.value,
        status: '1',
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

  private editZoneData(): void {
    //    this.apiService.editZone(this.zoneData.uuid, {
    //   zone_code: this.zoneCodeFormControl.value,
    //   zone_name: this.zoneNameFormControl.value,
    //   zone_status: '1',
    //   modules,
    // })
    //   .subscribe(
    //     (result: any) => {
    //       this.isEdit = false;
    //       let data = result.data;
    //       data.edit = true;
    //       this.updateTableData.emit(data);
    //       this.fds.close();
    //     },
    //     (err) => {
    //       this.toaster.showError('Error', err.error.message);
    //     }
    //   );
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  open() {
    let response: any;
    let data = {
      title: 'Zone Code',
      functionFor: 'zone',
      // code: this.nextCommingNumberofZoneCode,
      prefix: this.nextCommingNumberofZoneCodePrefix,
      key: this.nextCommingNumberofZoneCode.length
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
        // if (res.type == 'manual' && res.enableButton) {
        //   this.zoneCodeFormControl.setValue('');
        //   this.nextCommingNumberofZoneCode = '';
        //   this.zoneCodeFormControl.enable();
        // } else if (res.type == 'autogenerate' && !res.enableButton) {
        //   this.zoneCodeFormControl.setValue(
        //     res.data.next_coming_number_zone
        //   );
        //   this.nextCommingNumberofZoneCode =
        //     res.data.next_coming_number_zone;
        //   this.nextCommingNumberofZoneCodePrefix = res.reqData.prefix_code;
        //   this.zoneCodeFormControl.disable();
        // }
      });
  }
}

