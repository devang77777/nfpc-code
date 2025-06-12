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
// import { ApiService } from '../../../services/api.service';
// import { Utils } from '../../../services/utils';
// import { RouteMaster } from '../../datatables/route-master-dt/route-master-dt.component';
// import { DataEditor } from '../../../services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
// import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';
// import { AreaFormComponent } from '../../dialog-forms/area-form/area-form.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteMaster } from '../route-master-dt/route-master-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { AreaFormComponent } from 'src/app/components/dialog-forms/area-form/area-form.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { Utils } from 'src/app/services/utils';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { APP } from 'src/app/app.constant';

@Component({
  selector: 'app-add-route-form',
  templateUrl: './add-route-form.component.html',
  styleUrls: ['./add-route-form.component.scss'],
})
export class AddRouteFormComponent implements OnInit, OnDestroy {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  data;
  public routeFormGroup: FormGroup;
  public routeCodeFormControl: FormControl;
  public nameFormControl: FormControl;
  public vanFormControl: FormControl;
  public areaFormControl: FormControl;
  public subAreaFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public depotFormControl: FormControl;
  public vehicleNameControl: FormControl;
  nextCommingNumberofrouteCode: string = '';
  public depots: any[];
  public areas: any[] = [];
  public subAreas: any;
  public salesmen: any;
  public formType: string;
  private routeData: RouteMaster;
  customFields: Array<any> = [];
  private isEdit: boolean;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private toaster: CommonToasterService;
  isSubmit=false;
  editData = [];
  isCustomField = false;
  moduleId = APP.MODULE.ROUTE;
  nextCommingNumberofrouteCodePrefix: any;
  vehiclesList: any[];

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
    this.getVanVehicleDetails();
    this.getCustomFieldStatus();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.routeFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getrouteCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
    });
    this.nameFormControl = new FormControl('', [Validators.required]);
    // this.vanFormControl = new FormControl('', [Validators.required]);
    this.areaFormControl = new FormControl('', [Validators.required]);
    // this.subAreaFormControl = new FormControl('', [Validators.required]);
    // this.salesmanFormControl = new FormControl('', [Validators.required]);vehicleNameControl
    this.routeCodeFormControl = new FormControl('', [Validators.required]);
    this.depotFormControl = new FormControl('', [Validators.required]);
    this.vehicleNameControl = new FormControl('', [Validators.required]);
    this.routeFormGroup = new FormGroup({
      route_code: this.routeCodeFormControl,
      route_name: this.nameFormControl,
      route_area: this.areaFormControl,
      route_depot: this.depotFormControl,
      route_van: this.vehicleNameControl,
      customer_from: new FormControl('', [Validators.required]),
      customer_to: new FormControl('', [Validators.required]),
      order_from: new FormControl('', [Validators.required]),
      order_to: new FormControl('', [Validators.required]),
      invoice_from: new FormControl('', [Validators.required]),
      invoice_to: new FormControl('', [Validators.required]),
      collection_from: new FormControl('', [Validators.required]),
      collection_to: new FormControl('', [Validators.required]),
      credit_note_from: new FormControl('', [Validators.required]),
      credit_note_to: new FormControl('', [Validators.required]),
      unload_from: new FormControl('', [Validators.required]),
      unload_to: new FormControl('', [Validators.required]),
      // route_van: this.vanFormControl,
      // route_sub_area: this.subAreaFormControl,
      // route_salesman: this.salesmanFormControl
    });
    this.routeCodeFormControl.disable();
    this.subscriptions.push(
      this.apiService.getAllAreas().subscribe((result: any) => {
        let areaArray: any[];
        areaArray = result.data;
        this.getArea(areaArray);
      })
    );

    this.subscriptions.push(
      this.apiService.getAllDepots().subscribe((result: any) => {
        this.depots = result.data;
      })
    );

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        setTimeout(() => {
          if (data && data.uuid && this.isEdit) {
            this.editData = result.data.custom_field_value_save;
            this.routeCodeFormControl.setValue(data.route_code);
            this.routeCodeFormControl.disable();
            this.nameFormControl.setValue(data.route_name);

            // this.vanFormControl.setValue(data.route_van);
            this.areaFormControl.setValue(data.area_id);
            this.depotFormControl.setValue(data.depot_id);
            this.vehicleNameControl.setValue(data.van_id);
            this.routeFormGroup.get('customer_from').setValue(data.salesman_number_range.customer_from);
            this.routeFormGroup.get('customer_to').setValue(data.salesman_number_range.customer_to);
            this.routeFormGroup.get('order_from').setValue(data.salesman_number_range.order_from);
            this.routeFormGroup.get('order_to').setValue(data.salesman_number_range.order_to);
            this.routeFormGroup.get('invoice_from').setValue(data.salesman_number_range.invoice_from);
            this.routeFormGroup.get('invoice_to').setValue(data.salesman_number_range.invoice_to);
            this.routeFormGroup.get('collection_from').setValue(data.salesman_number_range.collection_from);
            this.routeFormGroup.get('collection_to').setValue(data.salesman_number_range.collection_to);
            this.routeFormGroup.get('credit_note_from').setValue(data.salesman_number_range.credit_note_from);
            this.routeFormGroup.get('credit_note_to').setValue(data.salesman_number_range.credit_note_to);
            this.routeFormGroup.get('unload_from').setValue(data.salesman_number_range.unload_from);
            this.routeFormGroup.get('unload_to').setValue(data.salesman_number_range.unload_to);
            // this.salesmanFormControl.setValue(data.route_salesman);
            this.routeData = data;
            this.isEdit = true;
          }
        }, 100);

        return;
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


  getrouteCode() {
    let nextNumber = {
      function_for: 'route',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofrouteCode = res.data.number_is;
        this.nextCommingNumberofrouteCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofrouteCode) {
          this.routeCodeFormControl.setValue(this.nextCommingNumberofrouteCode);
          this.routeCodeFormControl.disable();
        } else if (this.nextCommingNumberofrouteCode == null) {
          this.nextCommingNumberofrouteCode = '';
          this.routeCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofrouteCode = '';
        this.routeCodeFormControl.enable();
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

  public close() {
    this.fds.close();
    this.routeFormGroup.reset();
    this.isEdit = false;
  }

  public saveRouteData(): void {
    if (this.routeFormGroup.invalid) {
      return;
    }

    if (this.isEdit) {
      this.editRouteData();
      return;
    }

    this.postRouteData();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
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
  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }

  private postRouteData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .addNewRoute({
        status: '1',
        route_name: this.nameFormControl.value,
        route_code: this.routeCodeFormControl.value,
        // route_van: this.vanFormControl.value,
        // route_sub_area: this.subAreaFormControl.value,vehicleNameControl
        // route_salesman: this.salesmanFormControl.value,
        customer_from: this.routeFormGroup.value.customer_from,
        customer_to: this.routeFormGroup.value.customer_to,
        order_from: this.routeFormGroup.value.order_from,
        order_to: this.routeFormGroup.value.order_to,
        invoice_from: this.routeFormGroup.value.invoice_from,
        invoice_to: this.routeFormGroup.value.invoice_to,
        collection_from: this.routeFormGroup.value.collection_from,
        collection_to: this.routeFormGroup.value.collection_to,
        credit_note_from: this.routeFormGroup.value.credit_note_from,
        credit_note_to: this.routeFormGroup.value.credit_note_to,
        unload_from: this.routeFormGroup.value.unload_from,
        unload_to: this.routeFormGroup.value.unload_to,
        area_id: this.areaFormControl.value,
        depot_id: this.depotFormControl.value,
        van_id: this.vehicleNameControl.value,
        modules,
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editRouteData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .editRoute(this.routeData.uuid, {
        status: this.routeData.status,
        route_name: this.nameFormControl.value,
        route_code: this.routeCodeFormControl.value,
        customer_from: this.routeFormGroup.value.customer_from,
        customer_to: this.routeFormGroup.value.customer_to,
        order_from: this.routeFormGroup.value.order_from,
        order_to: this.routeFormGroup.value.order_to,
        invoice_from: this.routeFormGroup.value.invoice_from,
        invoice_to: this.routeFormGroup.value.invoice_to,
        collection_from: this.routeFormGroup.value.collection_from,
        collection_to: this.routeFormGroup.value.collection_to,
        credit_note_from: this.routeFormGroup.value.credit_note_from,
        credit_note_to: this.routeFormGroup.value.credit_note_to,
        unload_from: this.routeFormGroup.value.unload_from,
        unload_to: this.routeFormGroup.value.unload_to,
        area_id: this.areaFormControl.value,
        depot_id: this.depotFormControl.value,
        van_id: this.vehicleNameControl.value,
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
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  open() {
    let response: any;
    let data = {
      title: 'Route Code',
      functionFor: 'route',
      code: this.nextCommingNumberofrouteCode,
      prefix: this.nextCommingNumberofrouteCodePrefix,
      key: this.nextCommingNumberofrouteCode.length ? 'autogenerate' : 'manual',
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
          this.routeCodeFormControl.setValue('');
          this.nextCommingNumberofrouteCode = '';
          this.routeCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.routeCodeFormControl.setValue(res.data.next_coming_number_route);
          this.nextCommingNumberofrouteCode = res.data.next_coming_number_route;
          this.nextCommingNumberofrouteCodePrefix = res.reqData.prefix_code;
          this.routeCodeFormControl.disable();
        }
      });
  }



  getVanVehicleDetails() {
    this.apiService.getAllVans().subscribe((response) => {
      this.vehiclesList = response.data;
    });
  }
}
