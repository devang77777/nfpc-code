import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { SettingsService } from '../../../settings.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { fromArray } from '@amcharts/amcharts4/.internal/core/utils/Iterator';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-add-location-storage',
  templateUrl: './add-location-storage.component.html',
  styleUrls: ['./add-location-storage.component.scss']
})
export class AddLocationStorageComponent implements OnInit {
  @Output() updateLocationTableData: EventEmitter<any> = new EventEmitter();
  @Output() closeStorageDrawer: EventEmitter<any> = new EventEmitter();

  public formType: string;
  public storageFormGroup;
  public storageData;
  public isEdit: boolean = false;
  private apiService: ApiService;
  private settingService: SettingsService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public selectedRoute: any[] = [];
  storageCode: string = '';
  storageCodePrefix: any;
  constructor(private ctc: CommonToasterService, apiService: ApiService, private fb: FormBuilder, private fds: FormDrawerService, settingService: SettingsService, dataEditor: DataEditor, public dialog: MatDialog,
    private router: Router) {
    Object.assign(this, { fds, apiService, settingService, dataEditor });
  }

  public ngOnInit(): void {
    this.storageFormGroup = this.fb.group({
      storageCode: ['', [Validators.required]],
      name: ['', [Validators.required]],
      type: ['0'],
      route: ['', [Validators.required]],
      locationType: ['1', [Validators.required]],
    });

    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      this.storageFormGroup.reset();
      const data: any = result.data;
      this.isEdit = result.isEdit;
      this.storageData = data;

      if (data?.depot_id) {
        this.getRoutes(data?.depot_id);
      }

      if (!result.isEdit) {
        this.getrouteitemgroupCode();
      }

      if (data && data.uuid && this.isEdit) {

        this.isEdit = true;
        this.storageFormGroup.patchValue({
          storageCode: data.code,
          name: data.name,
          type: data.route == null ? '1' : '0',
          route: data.route == null ? data.warehouse_id : data.route_id,
          locationType: data.loc_type.toString()
        })
      }
      return;
    }));
  }

  getrouteitemgroupCode() {
    let nextNumber = {
      function_for: 'storage_location',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.storageCode = res.data.number_is;
        this.storageCodePrefix = res.data.prefix_is;
        if (this.storageCode) {
          this.storageFormGroup.controls['storageCode'].setValue(
            this.storageCode
          );
          this.storageFormGroup.controls['storageCode'].disable();
        } else if (this.storageCode == null) {
          this.storageCode = '';
          this.storageFormGroup.controls['storageCode'].enable();
        }
      } else {
        this.storageCode = '';
        this.storageFormGroup.controls['storageCode'].enable();
      }
    });
  }

  getRoutes(id) {
    this.apiService.getDepot(id).subscribe((res: any) => {
      /// this.routeFormControl.reset();
      if (res.data.length) {
        this.storageFormGroup.controls['route'].enable();
        this.selectedRoute = res.data;
      } else {
        this.ctc.showWarning('', 'Selected Depot has no route');
        this.storageFormGroup.controls['route'].disable();
        this.storageFormGroup.get('route').setValidators(null)
      }

    });
  }

  typeChanged() {
    if (this.storageFormGroup.get('type').value == '0') {
      this.getRoutes(this.storageData.depot_id);
    }
    else {
      this.storageFormGroup.controls['route'].disable();
      this.storageFormGroup.get('route').setValidators(null)
    }
  }

  locationTypeChanged() {

  }

  openSetting() {
    let response: any;
    let data = {
      title: 'Storage Location',
      functionFor: 'storage_location',
      code: this.storageCode,
      prefix: this.storageCodePrefix,
      key: this.storageCode.length ? 'autogenerate' : 'manual',
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
          this.storageFormGroup.controls['storageCode'].setValue('');
          this.storageCode = '';
          this.storageFormGroup.controls['storageCode'].enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.storageFormGroup.controls['storageCode'].setValue(
            res.data.next_coming_number_asset_tracking
          );
          this.storageCode = res.data.next_coming_number_asset_tracking;
          this.storageCodePrefix = res.reqData.prefix_code;
          this.storageFormGroup.controls['storageCode'].disable();
        }
      });
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  public close() {

    this.storageFormGroup.patchValue({
      storageCode: '',
      name: '',
      type: '0',
      route: '',
      locationType: '1'
    });
    this.isEdit = false;
    this.closeStorageDrawer.emit();
  }
  public saveStorageData(): void {
    if (this.storageFormGroup.invalid) {

      return;
    }

    let form = this.storageFormGroup.value;
    let sForm = {
      "code": form.storageCode,
      "name": form.name,
      "warehouse_id": this.storageData.id,
      "loc_type": +form.locationType,
      "route_id": form.route
    }

    if (this.isEdit) {
      this.editStorageData(sForm);

      return;
    }

    this.postStorageData(sForm);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postStorageData(sForm) {
    this.apiService.addStorage(sForm).subscribe((result: any) => {
      let data = result.data;
      data.edit = false;
      this.updateLocationTableData.emit(data);
      this.close();
    });
  }

  private editStorageData(sForm): void {
    this.apiService.editStorage(this.storageData.uuid, sForm).subscribe((result: any) => {
      this.isEdit = false;
      let data = result.data;
      data.edit = true;
      this.updateLocationTableData.emit(data);
      this.close();
    });
  }

}
