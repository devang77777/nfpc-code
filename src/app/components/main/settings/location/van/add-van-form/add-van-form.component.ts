import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { VanMaster } from '../van-master-dt/van-master-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { APP } from 'src/app/app.constant';
import { VanCategoryFormComponent } from '../van-category-form/van-category-form.component';
import { VanTypeFormComponent } from '../van-type-form/van-type-form.component';
import { AreaFormComponent } from 'src/app/components/dialog-forms/area-form/area-form.component';

@Component({
  selector: 'app-add-van-form',
  templateUrl: './add-van-form.component.html',
  styleUrls: ['./add-van-form.component.scss'],
})
export class AddVanFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public vanFormGroup: FormGroup;
  public descriptionFormControl: FormControl;
  public plateNumberFormControl: FormControl;
  public capacityFormControl: FormControl;
  public fuelReadingFormControl: FormControl;
  public vanCodeFormControl: FormControl;
  public typeFormControl: FormControl;
  public categoryFormControl: FormControl;
  public areaFormControl: FormControl;
  nextCommingNumberofvanCode: string = '';
  public vanTypes = [];
  public vanCategories = [];
  public formType: string;
  private isEdit: boolean;
  private vanData: VanMaster;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  isCustomField = false;
  private toaster: CommonToasterService;
  customFields: Array<any> = [];
  editData = [];
  moduleId = APP.MODULE.VAN;
  nextCommingNumberofvanCodePrefix: any;
  public areas: any[] = [];

  constructor(
    fds: FormDrawerService,
    toaster: CommonToasterService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, toaster, dataEditor });
  }

  public ngOnInit(): void {
    this.getCustomFieldStatus();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.vanFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getvanCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.editData = result.data.custom_field_value_save;
            this.descriptionFormControl.setValue(data.description);
            this.plateNumberFormControl.setValue(data.plate_number);
            this.vanCodeFormControl.disable();
            this.capacityFormControl.setValue(data.capacity);
            this.fuelReadingFormControl.setValue(data.reading ? data.reading : 0);
            this.areaFormControl.setValue(data.area_id);
            this.typeFormControl.setValue(data.van_type_id);
            this.categoryFormControl.setValue(data.van_category_id);
            this.vanCodeFormControl.setValue(data.van_code);
            this.vanData = data;
            this.isEdit = true;
          }

          return;
        })
      );
    });
    this.descriptionFormControl = new FormControl('', [Validators.required]);
    this.plateNumberFormControl = new FormControl('', [Validators.required]);
    this.capacityFormControl = new FormControl('');
    this.fuelReadingFormControl = new FormControl('');
    this.typeFormControl = new FormControl('', [Validators.required]);
    this.categoryFormControl = new FormControl('');
    this.vanCodeFormControl = new FormControl('', [Validators.required]);
    this.areaFormControl = new FormControl('', [Validators.required]);
    this.vanFormGroup = new FormGroup({
      vanDescription: this.descriptionFormControl,
      vanPlateNumber: this.plateNumberFormControl,
      vanCapacity: this.capacityFormControl,
      vanFuelReading: this.fuelReadingFormControl,
      vanType: this.typeFormControl,
      vanCategory: this.categoryFormControl,
      vanCode: this.vanCodeFormControl,
      route_area: this.areaFormControl
    });
    this.vanCodeFormControl.disable();
    this.getAllVanCategories();
    this.getAllVanTypes();
    this.apiService.getAllAreas().subscribe((result: any) => {
      let areaArray: any[];
      areaArray = result.data;
      this.getArea(areaArray);
    })

  }
  getArea(array: any[]) {
    array.forEach((x) => {
      this.areas.push(x);
      if (x.children.length > 0) {
        this.getArea(x.children);
      }
    });
  }

  getAllVanCategories() {
    this.subscriptions.push(
      this.apiService.getAllVanCategories().subscribe((result: any) => {
        this.vanCategories = result.data;
        //console.log(this.vanCategories);
      })
    );
  }

  getAllVanTypes() {
    this.subscriptions.push(
      this.apiService.getAllVanTypes().subscribe((result: any) => {
        this.vanTypes = result.data;
        //console.log(this.vanTypes);
      })
    );
  }

  getvanCode() {
    let nextNumber = {
      function_for: 'van',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofvanCode = res.data.number_is;
        this.nextCommingNumberofvanCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofvanCode) {
          this.vanCodeFormControl.setValue(this.nextCommingNumberofvanCode);
          this.vanCodeFormControl.disable();
        } else if (this.nextCommingNumberofvanCode == null) {
          this.nextCommingNumberofvanCode = '';
          this.vanCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofvanCode = '';
        this.vanCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
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
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
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
  public close() {
    this.fds.close();
    this.vanFormGroup.reset();
    this.isEdit = false;
  }

  public saveVanData(): void {
    if (this.vanFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      this.editVanData();

      return;
    }

    this.postVanData();
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
  public areaSelected(data: any): void {
    this.areaFormControl.setValue(data.id);
  }
  public areaProvider(): Observable<any[]> {
    return this.apiService.getAllAreas().pipe(map((result) => result.data));
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postVanData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;
    this.apiService
      .addNewVan({
        plate_number: this.plateNumberFormControl.value,
        description: this.descriptionFormControl.value,
        capacity: this.capacityFormControl.value,
        reading: this.fuelReadingFormControl.value,
        van_type_id: this.typeFormControl.value,
        van_category_id: this.categoryFormControl.value,
        van_code: this.vanCodeFormControl.value,
        van_status: 1,
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

  private editVanData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .editVan(this.vanData.uuid, {
        plate_number: this.plateNumberFormControl.value,
        description: this.descriptionFormControl.value,
        capacity: this.capacityFormControl.value,
        reading: this.fuelReadingFormControl.value,
        area_id: this.areaFormControl.value,
        van_type_id: this.typeFormControl.value,
        van_category_id: this.categoryFormControl.value,
        van_code: this.vanCodeFormControl.value,
        van_status: 1,
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
  open() {
    let response: any;
    let data = {
      title: 'Van Code',
      functionFor: 'van',
      code: this.nextCommingNumberofvanCode,
      prefix: this.nextCommingNumberofvanCodePrefix,
      key: this.nextCommingNumberofvanCode.length ? 'autogenerate' : 'manual',
    };
    //console.log('data', data);
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '340px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.vanCodeFormControl.setValue('');
          this.nextCommingNumberofvanCode = '';
          this.vanCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.vanCodeFormControl.setValue(res.data.next_coming_number_van);
          this.nextCommingNumberofvanCode = res.data.next_coming_number_van;
          this.nextCommingNumberofvanCodePrefix = res.reqData.prefix_code;
          this.vanCodeFormControl.disable();
        }
      });
  }

  public vanCategoryProvider(): Observable<any[]> {
    return this.apiService
      .getAllVanCategories()
      .pipe(map((result) => result.data));
  }
  public VanCategorySelected(data: any): void {
    this.categoryFormControl.setValue(data.id);
  }
  public openVanCategory(): void {
    this.dialog
      .open(VanCategoryFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.getAllVanCategories();
        if (!result) {
          return;
        }
        this.categoryFormControl.setValue(result.id);
      });
  }

  public vanTypeProvider(): Observable<any[]> {
    return this.apiService
      .getAllVanTypes()
      .pipe(map((result) => result.data));
  }
  public VanTypeSelected(data: any): void {
    this.typeFormControl.setValue(data.id);
  }
  public openVanType(): void {
    this.dialog
      .open(VanTypeFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.getAllVanTypes();
        if (!result) {
          return;
        }
        this.typeFormControl.setValue(result.id);
      });
  }
}
