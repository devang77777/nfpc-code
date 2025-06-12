import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BranchDepotMaster } from '../branch-depot-master-dt/branch-depot-master-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { AreaFormComponent } from 'src/app/components/dialog-forms/area-form/area-form.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { Utils } from 'src/app/services/utils';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { APP } from 'src/app/app.constant';

@Component({
  selector: 'app-add-branch-depot-form',
  templateUrl: './add-branch-depot-form.component.html',
  styleUrls: ['./add-branch-depot-form.component.scss'],
})
export class AddBranchDepotFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public branchDepotFormGroup: FormGroup;
  public nameFormControl: FormControl;
  public managerFormControl: FormControl;
  public contactFormControl: FormControl;
  public regionFormControl: FormControl;
  public codeFormControl: FormControl;
  public areaFormControl: FormControl;
  public formType: string;
  public regions: any;
  editData = [];
  public areas: any[] = [];
  nextCommingNumberofdepotCode: string = '';
  private isEdit: boolean;
  private depotData: BranchDepotMaster;
  private fds: FormDrawerService;
  private apiService: ApiService;
  customFields: Array<any> = [];
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  isCustomField = false;
  private toaster: CommonToasterService;
  moduleId = APP.MODULE.BRANCH_DEPOT;
  nextCommingNumberofdepotCodePrefix: any;

  constructor(
    fds: FormDrawerService,
    toaster: CommonToasterService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor, toaster });
  }

  public ngOnInit(): void {
    this.getCustomFieldStatus();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      if (this.branchDepotFormGroup) {
        this.branchDepotFormGroup.reset();
      }
      if (this.formType != 'Edit') {
        this.getdepotCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          setTimeout(() => {
            if (data && data.uuid && this.isEdit) {
              this.editData = result.data.custom_field_value_save;
              this.nameFormControl.setValue(data.depot_name);
              this.codeFormControl.disable();
              this.codeFormControl.setValue(data.depot_code);
              this.managerFormControl.setValue(data.depot_manager);
              this.regionFormControl.setValue(data.region_id);
              this.contactFormControl.setValue(data.depot_manager_contact);
              this.areaFormControl.setValue(data.area_id);
              this.depotData = data;
              this.isEdit = true;
            }
          }, 50);
          return;
        })
      );
    });
    this.nameFormControl = new FormControl('', [Validators.required]);
    this.managerFormControl = new FormControl('', [Validators.required]);
    this.regionFormControl = new FormControl('', [Validators.required]);
    this.contactFormControl = new FormControl('');
    this.codeFormControl = new FormControl('', [Validators.required]);
    this.areaFormControl = new FormControl('', [Validators.required]);

    // this.getdepotCode();
    this.branchDepotFormGroup = new FormGroup({
      bdName: this.nameFormControl,
      bdManager: this.managerFormControl,
      bdRegion: this.regionFormControl,
      bdContact: this.contactFormControl,
      code: this.codeFormControl,
      bdArea: this.areaFormControl,
    });
    this.codeFormControl.disable();
    this.subscriptions.push(
      this.apiService.getAllRegions().subscribe((result: any) => {
        this.regions = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getAllAreas().subscribe((result: any) => {
        this.getArea(result.data);
      })
    );
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
  getdepotCode() {
    let nextNumber = {
      function_for: 'depot',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofdepotCode = res.data.number_is;
        this.nextCommingNumberofdepotCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofdepotCode) {
          this.codeFormControl.setValue(this.nextCommingNumberofdepotCode);
          this.codeFormControl.disable();
        } else if (this.nextCommingNumberofdepotCode == null) {
          this.nextCommingNumberofdepotCode = '';
          this.codeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofdepotCode = '';
        this.codeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }
  getArea(array: any[]) {
    array.forEach((x) => {
      this.areas.push(x);
      if (x.children.length > 0) {
        this.getArea(x.children);
      }
    });
  }
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }
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
  public close(): void {
    this.fds.close();
    this.branchDepotFormGroup.reset();
    this.isEdit = false;
  }

  public saveBranchDepotData(): void {
    if (this.branchDepotFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      this.editBranchDepotData();

      return;
    }

    this.postBranchDepotData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  private postBranchDepotData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .addNewBranchDepot({
        user_id: null,
        status: '1',
        depot_code: this.codeFormControl.value,
        depot_name: this.nameFormControl.value,
        depot_manager: this.managerFormControl.value,
        region_id: this.regionFormControl.value,
        depot_manager_contact: this.contactFormControl.value,
        area_id: this.areaFormControl.value,
        modules,
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editBranchDepotData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .editBranchDepot(this.depotData.uuid, {
        user_id: null,
        depot_code: this.codeFormControl.value,
        status: this.depotData.status,
        depot_name: this.nameFormControl.value,
        depot_manager: this.managerFormControl.value,
        region_id: this.regionFormControl.value,
        depot_manager_contact: this.contactFormControl.value,
        area_id: this.areaFormControl.value,
        modules,
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
  openArea() {
    let dialogRef = this.dialog.open(AreaFormComponent, {
      width: '650px',
      position: {
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.subscriptions.push(
        this.apiService
          .getAllAreas()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((areas) => {
            this.areas = areas;
          })
      );

      if (!result) {
        return;
      }

      this.areaFormControl.setValue(result.id);
    });
  }
  public areaProvider(): Observable<any[]> {
    return this.apiService.getAllAreas().pipe(map((result) => result.data));
  }

  public areaSelected(data: any): void {
    this.areaFormControl.setValue(data.id);
  }
  open() {
    let response: any;
    let data = {
      title: 'Depot Code',
      functionFor: 'depot',
      code: this.nextCommingNumberofdepotCode,
      prefix: this.nextCommingNumberofdepotCodePrefix,
      key: this.nextCommingNumberofdepotCode.length ? 'autogenerate' : 'manual',
    };

    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '340px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.codeFormControl.setValue('');
          this.nextCommingNumberofdepotCode = '';
          this.codeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.codeFormControl.setValue(res.data.next_coming_number_depot);
          this.nextCommingNumberofdepotCode = res.data.next_coming_number_depot;
          this.nextCommingNumberofdepotCodePrefix = res.reqData.prefix_code;
          this.codeFormControl.disable();
        }
      });
  }
}
