import { CommonToasterService } from 'src/app/services/common-toaster.service';
//import { Warehouse } from 'src/app/components/datatables/warehouse-dt/warehouse-dt.component';
import { Component, ElementRef, EventEmitter, NgZone, OnInit, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
//import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';

import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { Warehouse } from '../warehouse-dt/warehouse-dt.component';
import { APP } from 'src/app/app.constant';
import { MapsAPILoader } from '@agm/core';
@Component({
  selector: 'app-add-warehouse-page',
  templateUrl: './add-warehouse-page.component.html',
  styleUrls: ['./add-warehouse-page.component.scss'],
})
export class AddWarehousePageComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  warehouseFormGroup: FormGroup;
  warehouseCodeFormControl: FormControl;
  warehouseNameFormControl: FormControl;
  warehouseManagerFormControl: FormControl;
  primaryWarehouseFormControl: FormControl;
  mainWareHouseFormControl: FormControl;
  depotFormControl: FormControl;
  routeFormControl: FormControl;
  locationFormControl: FormControl;
  nextCommingNumberofWarehouseCode: string = '';
  warehouseFormSubmitted: boolean = false;
  public selectedRoute: any[] = [];


  @ViewChild('locationSrch') public locationSrch: ElementRef;

  public warehouseData: Warehouse;
  private subscriptions: Subscription[] = [];
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public isEdit: boolean = false;
  public areas: any[] = [];
  public depot: any[] = [];
  public warehousedate: any[] = [];
  lat = 0.0000;
  lang = 0.0000;
  public foods: any[] = [
    { value: 1, primaryWarehouse: 'warehouse1', depotValue: 'depot1' },
    { value: 2, primaryWarehouse: 'warehouse1', depotValue: 'depot2' },
    { value: 3, primaryWarehouse: 'warehouse1', depotValue: 'depot3' },
  ];
  isCustomField = false;
  private toaster: CommonToasterService;
  moduleId = APP.MODULE.WAREHOUSE;
  customFields: Array<any> = [];
  editData = [];
  nextCommingNumberofWarehouseCodePrefix: any;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private ctc: CommonToasterService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  ngOnInit(): void {
    this.initLocationSearch();
    this.buildForm();
    this.getCustomFieldStatus();
    this.routeFormControl.disable();
    this.subscriptions.push(
      this.fds.formType.subscribe((s) => {
        this.formType = s;
        if (this.formType == 'Add') {
          //   setTimeout(() => {
          //   this.warehouseFormGroup.reset();
          //   this.getWarehouseCode()
          //   this.isEdit = false
          // }, 2500);
          this.warehouseFormGroup.reset();
          this.getWarehouseCode();
          this.isEdit = false;
        } else if (this.formType == 'Edit') {
          this.isEdit = true;
          // this.buildForm();
          // this.warehouseFormGroup.reset();
          this.subscriptions.push(
            this.dataEditor.newData.subscribe((result) => {
              const data: any = result.data;

              if (data && data.uuid && this.isEdit) {
                this.editData = result.data.custom_field_value_save;
                // this.warehouseFormGroup.reset();
                this.warehouseCodeFormControl.setValue(data.code);
                this.warehouseCodeFormControl.disable();
                this.warehouseNameFormControl.setValue(data.name);
                this.warehouseManagerFormControl.setValue(data.manager);
                this.primaryWarehouseFormControl.setValue(
                  data.parent_warehouses?.id
                );
                this.depotFormControl.setValue(data.depot ? data.depot.id : '');
                this.subscriptions.push(
                  this.apiService.getDepot(data.depot_id).subscribe((res: any) => {
                    /// this.routeFormControl.reset();
                    if (res.data.length) {
                      this.routeFormControl.enable();
                      this.selectedRoute = res.data;
                    } else {
                      this.ctc.showWarning(
                        '',
                        'Please select a depot that have route'
                      );
                      this.routeFormControl.disable();
                    }
                  }));

                this.locationFormControl.setValue(data.address);
                this.routeFormControl.setValue(data.route?.id);
                //  this.routeFormControl.enable()
                this.warehouseData = data;
                this.isEdit = true;
              }
            })
          );
        }
        this.subscriptions.push(
          this.apiService.getAllBranchDepot().subscribe((result: any) => {
            //console.log('areas : ', result.data);
            this.depot = result.data;
          })
        );
        this.subscriptions.push(
          this.apiService.getwarehouseMainList().subscribe((result: any) => {
            this.warehousedate = result.data;
          })
        );
      }));

    this.warehouseCodeFormControl.disable();


  }

  initLocationSearch() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.locationSrch.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.locationFormControl.setValue(this.locationSrch.nativeElement.value);
          this.lat = place.geometry.location.lat();
          this.lang = place.geometry.location.lng();
        });
      });
    });
  }

  buildForm() {
    this.warehouseCodeFormControl = new FormControl('', [Validators.required]);
    this.warehouseNameFormControl = new FormControl('', [Validators.required]);
    this.warehouseManagerFormControl = new FormControl('');
    this.mainWareHouseFormControl = new FormControl(false);
    this.primaryWarehouseFormControl = new FormControl('');
    this.depotFormControl = new FormControl('');
    this.locationFormControl = new FormControl('');
    this.routeFormControl = new FormControl('');

    this.warehouseFormGroup = new FormGroup({
      warehouseCode: this.warehouseCodeFormControl,
      warehouseName: this.warehouseNameFormControl,
      warehouseManager: this.warehouseManagerFormControl,
      primaryWarehouse: this.primaryWarehouseFormControl,
      depot: this.depotFormControl,
      location: this.locationFormControl,
      route: this.routeFormControl,
    });
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  public close() {
    this.fds.close();
    this.warehouseFormGroup.reset();
    this.isEdit = false;
  }

  getWarehouseCode() {
    let nextNumber = {
      function_for: 'warehouse',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofWarehouseCode = res.data.number_is;
        this.nextCommingNumberofWarehouseCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofWarehouseCode) {
          this.warehouseCodeFormControl.setValue(
            this.nextCommingNumberofWarehouseCode
          );
          this.warehouseCodeFormControl.disable();
        } else if (this.nextCommingNumberofWarehouseCode == null) {
          this.nextCommingNumberofWarehouseCode = '';
          this.warehouseCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofWarehouseCode = '';
        this.warehouseCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }
  findUsersForUsers(data: any) {
    this.subscriptions.push(
      this.apiService.getDepot(data).subscribe((res: any) => {
        if (res.data.length) {
          this.selectedRoute = res.data;
          this.routeFormControl.enable();
        } else {
          this.ctc.showWarning('', 'Selected Depot has no route');
          this.routeFormControl.disable();
        }
      }));
  }
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
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

  open() {
    let response: any;
    let data = {
      title: 'Warehouse Code',
      functionFor: 'warehouse',
      code: this.nextCommingNumberofWarehouseCode,
      prefix: this.nextCommingNumberofWarehouseCodePrefix,
      key: this.nextCommingNumberofWarehouseCode.length
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
          this.warehouseCodeFormControl.setValue('');
          this.nextCommingNumberofWarehouseCode = '';
          this.warehouseCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.warehouseCodeFormControl.setValue(
            res.data.next_coming_number_warehouse
          );
          this.nextCommingNumberofWarehouseCode =
            res.data.next_coming_number_warehouse;
          this.nextCommingNumberofWarehouseCodePrefix = res.reqData.prefix_code;
          this.warehouseCodeFormControl.disable();
        }
      });
  }

  public saveWarehouse(): void {
    if (this.warehouseFormGroup.invalid) {
      Object.keys(this.warehouseFormGroup.controls).forEach((key) => {
        this.warehouseFormGroup.controls[key].markAsDirty();
      });
      return;
    }
    if (
      this.primaryWarehouseFormControl.value &&
      !this.depotFormControl.value
    ) {
      this.ctc.showWarning('', 'Please select the Depot field');
      return;
    }
    if (
      this.depotFormControl.value &&
      !this.primaryWarehouseFormControl.value
    ) {
      this.ctc.showWarning('', 'Please provide the Primary warehouse');
      return;
    }
    if (this.isEdit) {
      this.editCountryData();
      return;
    }

    this.postCountryData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postCountryData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .addwarehouseItem({
        manager: this.warehouseManagerFormControl.value,
        name: this.warehouseNameFormControl.value,
        code: this.warehouseCodeFormControl.value,
        address: this.locationFormControl.value,
        lat: this.lat,
        lang: this.lang,
        depot_id: this.depotFormControl.value,
        is_main: this.mainWareHouseFormControl.value ? 1 : 0,
        // route_id: this.routeFormControl.value,
        parent_warehouse_id: this.primaryWarehouseFormControl.value,
        modules,
      })
      .subscribe(
        (result: any) => {
          let data = result.data;
          data.edit = false;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => { }
      );
  }
  private editCountryData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .editwarehouseItem(this.warehouseData.uuid, {
        manager: this.warehouseManagerFormControl.value,
        name: this.warehouseNameFormControl.value,
        code: this.warehouseCodeFormControl.value,
        address: this.locationFormControl.value,
        lat: this.lat,
        lang: this.lang,
        depot_id: this.depotFormControl.value,
        is_main: this.mainWareHouseFormControl.value ? 1 : 0,
        // route_id: this.routeFormControl.value,
        parent_warehouse_id: this.primaryWarehouseFormControl.value,
        modules,
      })
      .subscribe(
        (result: any) => {
          this.isEdit = false;
          let data = result.data;
          data.edit = true;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => { }
      );
  }
}
