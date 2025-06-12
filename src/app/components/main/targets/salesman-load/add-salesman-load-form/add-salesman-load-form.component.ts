import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Component, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { RouteMaster } from '../../../settings/location/route/route-master-dt/route-master-dt.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { TargetService } from '../../target.service';

@Component({
  selector: 'app-add-salesman-load-form',
  templateUrl: './add-salesman-load-form.component.html',
  styleUrls: ['./add-salesman-load-form.component.scss'],
})
export class AddSalesmanLoadFormComponent implements OnInit {
  public routeControl = new FormControl();

  // filteredRoutes: Observable<string[]>;
  public title;
  public routes = [];
  public salesmen = [];
  public filteredSalesman = [];
  public filteredRoutes: RouteMaster[] = [];
  public editData;
  public isEdit: boolean;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private targetService: TargetService;
  private dataEditor: DataEditor;
  private dialogRef: MatDialog;
  private router: Router;
  private route: ActivatedRoute;
  private subscriptions: Subscription[] = [];

  nextCommingNumber: string = '';
  public salesmanLoadFormGroup: FormGroup;
  public loadNumberFormControl: FormControl;
  public routeFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public loadDateFormControl: FormControl;
  public loadTypeFormControl: FormControl;
  public itemsFormControl: FormControl;
  public depotFormControl: FormControl;
  nextCommingNumberPrefix: any;

  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    targetService: TargetService,
    dataEditor: DataEditor,
    dialogRef: MatDialog,
    router: Router,
    route: ActivatedRoute
  ) {
    Object.assign(this, {
      fds,
      apiService,
      targetService,
      dataEditor,
      dialogRef,
      router,
      route,
    });
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.router.url.includes('edit')) {
      let uuid;
      this.title = 'Edit Salesman Load';
      this.isEdit = true;
      this.route.paramMap.subscribe((params) => {
        uuid = params.get('uuid');
        this.targetService.getSalesmanLoadDetails(uuid).subscribe((res) => {
          this.editData = res.data;
          //console.log(this.editData);
          this.loadTypeFormControl.setValue(this.editData.load_type.toString());
          this.routeControl.setValue({
            id: this.editData.route?.id,
            route_name: this.editData.route?.route_name,
          });
          this.routeFormControl.setValue(this.editData.route_id);
          this.loadNumberFormControl.setValue(this.editData.load_number);
          this.loadDateFormControl.setValue(this.editData.load_date);
          this.salesmanFormControl.setValue(this.editData.salesman_id);
          setTimeout(() => {
            this.salesmen.forEach((sm) => {
              if (sm.route.id == this.editData.route_id) {
                this.filteredSalesman.push(sm);
              }
            });
          }, 1000);
        });
      });
    } else {
      this.title = 'Add Salesman Load';
      this.isEdit = false;
    }
    this.targetService
      .masterList({
        list_data: ['route'],
        function_for: 'load_number',
      })
      .subscribe((res) => {
        this.routes = res.data?.route;
        console.log(this.routes)
        if (!this.isEdit) {
          this.setLoadNumber(res.data.code);
        }
      });
    this.apiService.getSalesMan().subscribe((res) => {
      this.salesmen = res.data;
    });

    this.subscriptions.push(
      this.routeControl.valueChanges
        .pipe(
          startWith<string | RouteMaster>(''),
          map((value) =>
            typeof value === 'string' ? value : value.route_name
          ),
          map((value: string) => {
            return value.length
              ? this.filterRoutes(value)
              : this.routes.slice();
          })
        )
        .subscribe((value) => {
          this.filteredRoutes = value;
        })
    );
    // this.filteredRoutes = this.routeControl.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => this._filterRoute(value))
    //   );
  }
  private buildForm() {
    this.loadNumberFormControl = new FormControl();
    this.routeFormControl = new FormControl();
    this.salesmanFormControl = new FormControl();
    this.loadDateFormControl = new FormControl();
    this.loadTypeFormControl = new FormControl();
    this.itemsFormControl = new FormControl();
    this.depotFormControl = new FormControl();
    this.salesmanLoadFormGroup = new FormGroup({
      loadNumber: this.loadNumberFormControl,
      route: this.routeFormControl,
      salesman: this.salesmanFormControl,
      loadDate: this.loadDateFormControl,
      loadType: this.loadTypeFormControl,
      depot: this.depotFormControl
    });
  }
  private filterRoutes(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.routes.filter((route) =>
      route.route_name?.toLowerCase().includes(filterValue)
    );
  }
  onRouteChange() {
    let val = this.routeControl.value[0].id;
    let route = this.routes.find(x => x.id == val);
    console.log(route);
    this.depotFormControl.setValue(route.depot_id);
    this.dataEditor.updateDepotId(route.depot_id);
    this.routeFormControl.setValue(val);
    this.filteredSalesman = [];

    this.salesmen.forEach((sm) => {
      console.log(sm, val);
      if (sm.route?.id == val) {
        this.filteredSalesman.push(sm);
      }
    });
  }
  addRoute() {
    this.router.navigate(['/settings/route']).then(() => {
      this.fds.setFormName('add-route');
      this.fds.setFormType('Add');
      this.fds.open();
    });
  }
  close() {
    this.router.navigate(['/target/salesman-load']);
  }
  setLoadNumber(code: any) {
    if (code.number_is !== null) {
      this.nextCommingNumber = code.number_is;
      this.nextCommingNumberPrefix = code.prefix_is;
      this.loadNumberFormControl.setValue(this.nextCommingNumber);
      this.loadNumberFormControl.disable();
    } else {
      this.nextCommingNumber = '';
      this.loadNumberFormControl.enable();
    }
  }
  public openNumberSettings(): void {
    let response: any;
    let data = {
      title: 'Salesman Load',
      functionFor: 'load_number',
      code: this.loadNumberFormControl.value,
      prefix: this.nextCommingNumberPrefix,
      key: this.nextCommingNumber.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.loadNumberFormControl.setValue('');
          this.loadNumberFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.loadNumberFormControl.setValue(
            res.data.next_coming_number_load_number
          );
          this.nextCommingNumberPrefix = res.reqData.prefix_code;
          this.loadNumberFormControl.disable();
        }
      });
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  public submitSalesmanLoad() {
    const fd = this.salesmanLoadFormGroup.value;
    const data = {
      load_number: this.loadNumberFormControl.value,
      route_id: fd.route,
      salesman_id: fd.salesman[0].id,
      load_date: fd.loadDate,
      load_type: fd.loadType,
      load_confirm: 0,
      status: 0,
      items: [],
    };
    this.salesmanLoadFormGroup.value.items.forEach((item) => {
      data.items.push({
        item_id: item?.item.id,
        item_uom: item.uom,
        load_qty: item.qty,
      });
    });
    //console.log(JSON.stringify(data));
    if (this.editData) {
      this.targetService
        .editSalesmanLoad(data, this.editData.uuid)
        .subscribe((res) => {
          this.router.navigate(['target/salesman-load']);
        });
    } else {
      this.targetService.addSalesmanLoad(data).subscribe((res) => {
        this.router.navigate(['target/salesman-load']);
      });
    }
  }
}
