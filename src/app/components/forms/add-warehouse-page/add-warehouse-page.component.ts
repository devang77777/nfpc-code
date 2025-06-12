import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';
import { Warehouse } from '../../datatables/warehouse-dt/warehouse-dt.component';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-add-warehouse-page',
  templateUrl: './add-warehouse-page.component.html',
  styleUrls: ['./add-warehouse-page.component.scss'],
})
export class AddWarehousePageComponent implements OnInit {
  warehouseFormGroup: FormGroup;
  warehouseCodeFormControl: FormControl;
  warehouseNameFormControl: FormControl;
  warehouseManagerFormControl: FormControl;
  primaryWarehouseFormControl: FormControl;
  depotFormControl: FormControl;
  routeFormControl: FormControl;
  locationFormControl: FormControl;
  nextCommingNumberofWarehouseCode: string = '';
  warehouseFormSubmitted: boolean = false;


  public warehouseData: Warehouse;
  private subscriptions: Subscription[] = [];
  public formType: string;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  public isEdit: boolean;
  public areas: any;
  public depot: any;
  public foods: any[] = [
    { value: 1, primaryWarehouse: 'warehouse1', depotValue: 'depot1' },
    { value: 2, primaryWarehouse: 'warehouse1', depotValue: 'depot2' },
    { value: 3, primaryWarehouse: 'warehouse1', depotValue: 'depot3' },
  ];

  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  ngOnInit(): void {
    this.fds.formType.subscribe(s => {
      this.formType = s
      this.warehouseFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getWarehouseCode()

      }
    });

    this.buildForm();
    this.warehouseCodeFormControl.disable();
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        if (data && data.uuid) {
          this.warehouseCodeFormControl.setValue(data.code);
          this.warehouseCodeFormControl.disable();
          this.warehouseNameFormControl.setValue(data.name);
          this.warehouseManagerFormControl.setValue(data.manager);
          this.primaryWarehouseFormControl.setValue(data.parent_warehouse_id);
          this.depotFormControl.setValue(data.depot ? data.depot.id : '');
          this.locationFormControl.setValue(data.address);
          this.routeFormControl.setValue(data.route ? data.route.id : '')
          this.warehouseData = data;
          this.isEdit = true;
        }
      })
    );
    this.subscriptions.push(
      this.apiService.getAllRoute().subscribe((result: any) => {
        //console.log('areas : ', result.data);
        this.areas = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getAllBranchDepot().subscribe((result: any) => {
        //console.log('areas : ', result.data);
        this.depot = result.data;
      })
    );
  }

  buildForm() {
    this.warehouseCodeFormControl = new FormControl('', [Validators.required]);
    this.warehouseNameFormControl = new FormControl('', [Validators.required]);
    this.warehouseManagerFormControl = new FormControl('', [
      Validators.required,
    ]);
    this.primaryWarehouseFormControl = new FormControl('');
    this.depotFormControl = new FormControl('');
    this.locationFormControl = new FormControl('', [Validators.required]);
    this.routeFormControl = new FormControl('', [Validators.required]);

    this.warehouseFormGroup = new FormGroup({
      warehouseCode: this.warehouseCodeFormControl,
      warehouseName: this.warehouseNameFormControl,
      warehouseManager: this.warehouseManagerFormControl,
      primaryWarehouse: this.primaryWarehouseFormControl,
      depot: this.depotFormControl,
      location: this.locationFormControl,
      route: this.routeFormControl
    });
    //https://www.loom.com/share/046440344fab413ebffdbf23fc6e1bc3
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
        if (this.nextCommingNumberofWarehouseCode) {
          this.warehouseCodeFormControl.setValue(
            this.nextCommingNumberofWarehouseCode
          );
          this.warehouseCodeFormControl.disable();
        }
        else if (this.nextCommingNumberofWarehouseCode == null) {
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

  open() {
    let response: any;
    let data = {
      title: 'Warehouse Code',
      functionFor: 'warehouse',
      code: this.warehouseCodeFormControl.value,
      key: this.nextCommingNumberofWarehouseCode.length ? 'autogenerate' : 'manual'
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '306px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.warehouseCodeFormControl.setValue('');
          this.warehouseCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.warehouseCodeFormControl.setValue(res.data.next_coming_number_warehouse);
          this.nextCommingNumberofWarehouseCode = res.reqData.prefix_code;
          this.warehouseCodeFormControl.disable();
        }
      });
  }
  // tslint:disable-next-line: adjacent-overload-signatures
  public saveWarehouse(): void {
    if (this.warehouseFormGroup.invalid) {
      Object.keys(this.warehouseFormGroup.controls).forEach(key => {
        this.warehouseFormGroup.controls[key].markAsDirty();
      });
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

    this.apiService.addwarehouseItem({
      manager: this.warehouseManagerFormControl.value,
      name: this.warehouseNameFormControl.value,
      code: this.warehouseCodeFormControl.value,
      address: this.locationFormControl.value,
      depot_id: this.depotFormControl.value,
      route_id: this.routeFormControl.value,
    }).subscribe((result: any) => {
      this.fds.close().then(success => {
        window.location.reload();
      });
    }, err => {
      // alert(err.error.message);
    });
  }
  private editCountryData(): void {
    this.apiService.editwarehouseItem(this.warehouseData.uuid, {
      manager: this.warehouseManagerFormControl.value,
      name: this.warehouseNameFormControl.value,
      code: this.warehouseCodeFormControl.value,
      address: this.locationFormControl.value,
      depot_id: this.depotFormControl.value,
      route_id: this.routeFormControl.value,
    }).subscribe((result: any) => {
      this.isEdit = false;
      this.fds.close().then(success => {
        window.location.reload();
      });
    }, err => {
      // alert(err.error.message);
    });
  }
}
