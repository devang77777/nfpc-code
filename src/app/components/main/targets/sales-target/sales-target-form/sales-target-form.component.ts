import { ApiService } from 'src/app/services/api.service';
import { TargetService } from './../../target.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectChange } from '@angular/material/select';
import { map, startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import {
  SalesTargetHeaderDetail,
  SalesTargetItemDetail,
  SalesTargetModel,
  TargetControl,
  SALES_TARGET_ITEM_HEADER,
  SALES_TARGET_HEAD_HEADER_QTY,
  SALES_TARGET_HEAD_HEADER_VALUE,
  SALES_TARGET_HEAD_HEADER_FIXED_QTY,
  SALES_TARGET_HEAD_HEADER_FIXED_VALUE,
  SalesTargetItemModalData,
} from '../sales-target-model';

import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  ItemAddTableHeader,
  OrderItemsPayload,
} from 'src/app/components/main/transaction/orders/order-models';
import { InfoModal } from 'src/app/components/main/transaction/collection/collection-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import * as moment from 'moment';
import { SalesTargetItemModalComponent } from '../sales-target-item-modal/sales-target-item-modal.component';

@Component({
  selector: 'app-sales-target-form',
  templateUrl: './sales-target-form.component.html',
  styleUrls: ['./sales-target-form.component.scss'],
})
export class SalesTargetFormComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public pageTitle: string;
  public isEditForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public salesTargetNumber: string;
  public nextOrderNumber: string;
  public salesTargetData: SalesTargetModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public isItemSelected = true;

  public salesTargetFormGroup: FormGroup;
  public divisionFormControl: FormControl;
  public CodeFormControl: FormControl;
  public routeFormControl: FormControl;
  public totalTargetAmountFormControl: FormControl;

  public categoryFormGroup: FormGroup;
  public categoryFormControl: FormControl;
  public quantityFormControl: FormControl;

  public targetOnFormControl: FormControl;
  public nameFormControl: FormControl;
  public ownerFormControl: FormControl;
  public applyLevelFormControl: FormControl;
  public targetTypeFormControl: FormControl;
  public startDateFormControl: FormControl;
  public endDateFormControl: FormControl;
  public rangeTypeFormControl: FormControl;
  public commissionTypeFormControl: FormControl;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public headTableHeadersQty: ItemAddTableHeader[] = [];
  public headTableHeadersFixedQty: ItemAddTableHeader[] = [];
  public headTableHeadersValue: ItemAddTableHeader[] = [];
  public headTableHeadersFixedValue: ItemAddTableHeader[] = [];

  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  // public payloadItems: SalesTargetItemDetail[] = [];
  public payloadHeaders: SalesTargetHeaderDetail[] = [];

  public targetTypes: InfoModal[] = [];
  public regions: InfoModal[] = [];
  public salesmen: InfoModal[] = [];
  public depots: InfoModal[] = [];
  public owners: any[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedTargetId = 2;
  public selectedOwnerIds: number[];
  public formType: string;
  private router: Router;
  private targetService: TargetService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private elemRef: ElementRef;
  private fds: FormDrawerService;
  public displayedColumns = ['Category', 'Quantity', 'Action'];
  private finalSalesTargetPayload: any = {};
  public itemSource: any;
  private toaster: CommonToasterService;
  startOfMonth: any;
  endOfMonth: any;
  updating = true;
  constructor(
    public apiService: ApiService,
    targetService: TargetService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    fds: FormDrawerService,
    toaster: CommonToasterService,
    route: ActivatedRoute
  ) {
    Object.assign(this, {
      targetService,
      dataService,
      dialogRef,
      toaster,
      elemRef,
      formBuilder,
      router,
      fds,
      route,
    });
    this.itemSource = new MatTableDataSource<any>();
  }


  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      if (this.formType != 'Edit') {
      }
    });
    this.isEditForm = this.router.url.includes('/sales-target/edit/');
    this.itemTableHeaders = SALES_TARGET_ITEM_HEADER;
    this.headTableHeadersQty = SALES_TARGET_HEAD_HEADER_QTY;
    this.headTableHeadersValue = SALES_TARGET_HEAD_HEADER_VALUE;
    this.headTableHeadersFixedQty = SALES_TARGET_HEAD_HEADER_FIXED_QTY;
    this.headTableHeadersFixedValue = SALES_TARGET_HEAD_HEADER_FIXED_VALUE;
    this.salesTargetNumber = '#OD376382';

    this.targetOnFormControl = new FormControl(this.selectedTargetId, [
      Validators.required,
    ]);
    this.CodeFormControl = new FormControl('', [Validators.required]);
    this.routeFormControl = new FormControl('');
    this.divisionFormControl = new FormControl('');
    this.totalTargetAmountFormControl = new FormControl('', [
      Validators.required,
    ]);
    this.startDateFormControl = new FormControl('', [Validators.required]);
    this.endDateFormControl = new FormControl('', [Validators.required]);

    this.categoryFormControl = new FormControl('', [Validators.required]);
    this.quantityFormControl = new FormControl('', [Validators.required]);
    this.rangeTypeFormControl = new FormControl('fixed', [Validators.required]);
    this.commissionTypeFormControl = new FormControl('fixed', [
      Validators.required,
    ]);

    this.salesTargetFormGroup = this.formBuilder.group({
      route: this.routeFormControl,
      division: this.divisionFormControl,
      amount: this.totalTargetAmountFormControl,
      start_date: this.startDateFormControl,
      end_Date: this.endDateFormControl
    });
    this.categoryFormGroup = this.formBuilder.group({
      category: this.categoryFormControl,
      quantity: this.quantityFormControl
    })
    this.applyLevelFormControl.valueChanges.subscribe((value) => {
      if (this.updating) return;
      if (this.applyLevelFormControl.value === 'item' && this.isEditForm) {
        this.salesTargetFormGroup.controls['items'].reset();
        this.salesTargetFormGroup.controls['headers'].reset();
        this.addItemForm();
      } else if (
        this.applyLevelFormControl.value === 'header' &&
        this.isEditForm
      ) {
        this.salesTargetFormGroup.controls['items'].reset();
        this.salesTargetFormGroup.controls['headers'].reset();
        this.addHeaderForm();
      }
    });
    this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    if (this.isEditForm) {
      setTimeout(() => {
        this.updating = false;
      }, 2000);
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Sales Target';
      this.salesTargetData = this.route.snapshot.data['salesTarget'].data;
      // this.salesTargetFormGroup.setValue(this.salesTargetData)
      this.setupEditFormControls(this.salesTargetData);
    } else {
      this.pageTitle = 'Add Sales Target';
      this.addItemFilterToControl(0);
      this.startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      this.endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
      this.startDateFormControl.setValue(this.startOfMonth);
      this.endDateFormControl.setValue(this.endOfMonth);
    }

    this.subscriptions.push(
      this.targetService.getTargetEntities().subscribe((result) => {
        this.targetTypes = result.data;
      })
    );

    this.subscriptions.push(
      forkJoin({
        salesmen: this.targetService.getSalesMan(),
        regions: this.targetService.getRegion(),
        depots: this.targetService.getAllBranchDepot(),
      }).subscribe((result: { [key: string]: { data: any[] } }) => {
        this.salesmen = result.salesmen.data.map((item) => ({
          id: item.id,
          name: `${item.user.firstname} ${item.user.lastname}`,
        }));
        this.regions = result.regions.data.map((item) => ({
          id: item.id,
          name: item.region_name,
        }));
        this.depots = result.depots.data.map((item) => ({
          id: item.id,
          name: item.depot_name,
        }));

        this.setTargetOwners();
      })
    );

    this.subscriptions.push(
      this.targetOnFormControl.valueChanges.subscribe((value) => {
        this.ownerFormControl.reset();
        this.selectedOwnerIds = undefined;
        this.setTargetOwners();
      })
    );
  }
  public close() {
    this.fds.close();
    this.salesTargetFormGroup.reset();
    this.categoryFormGroup.reset();
  }

  months: any = [
    { name: 'January' },
    { name: 'February' },
    { name: 'March' },
    { name: 'April' },
    { name: 'May' },
    { name: 'June' },
    { name: 'July' },
    { name: 'August' },
    { name: 'September' },
    { name: 'Octobar' },
    { name: 'November' },
    { name: 'December' },
  ]

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  public setTargetOwners(): void {
    if (!this.salesmen.length || !this.depots.length || !this.regions.length) {
      return;
    }

    switch (this.targetOnFormControl.value) {
      case 1:
        this.owners = this.depots;
        break;
      case 3:
        this.owners = this.regions;
        break;
      case 2:
      default:
        this.owners = this.salesmen;
    }
  }

  public openItemTargetModal(itemForm: AbstractControl, index: number): void {
    const item = itemForm as FormGroup;
    const data: SalesTargetItemModalData = {
      item,
      itemIndex: index,
      targetControl: this.targetControl,
      commissionType: this.commissionTypeFormControl.value,
    };

    this.dialogRef
      .open(SalesTargetItemModalComponent, {
        width: '800px',
        position: { top: '0px' },
        data,
      })
      .afterClosed()
      .subscribe((customData: SalesTargetItemModalData) => {
        //console.log(customData);
      });
  }

  public setupEditFormControls(editData: any): void {
    const data = this.salesTargetData;
    editData['Applyon'] = editData['Applyon'] == '1' ? 'item' : 'header';
    editData['TargetVariance'] =
      editData['TargetVariance'] == '1' ? 'fixed' : 'slab';
    editData['CommissionType'] =
      editData['CommissionType'] == '1' ? 'fixed' : 'percentage';
    editData['TargetType'] =
      editData['TargetType'] == '1' ? 'quantity' : 'value';

    this.targetOnFormControl.patchValue(Number(editData.TargetEntity));
    this.applyLevelFormControl.patchValue(editData.Applyon);
    this.nameFormControl.patchValue(editData.TargetName);
    this.ownerFormControl.patchValue(editData.TargetOwnerId);
    this.startDateFormControl.patchValue(editData.StartDate);
    this.endDateFormControl.patchValue(editData.EndDate);
    this.rangeTypeFormControl.patchValue(editData.TargetVariance);
    editData.sales_item_target_detail.forEach((item, index: number) => {
      if (item.ApplyOn == '1') {
        this.addItemForm(item);
      } else {
        this.addHeaderForm(item);
      }
    });
  }

  public addItemForm(item?: any): void {
    const itemControls = this.salesTargetFormGroup.controls[
      'items'
    ] as FormArray;
    const newIndex = itemControls.length;

    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl({
            id: item.item_id,
            name: item.item ? item.item.item_name : null,
          }),
          item_uom_id: new FormControl(item.item_uom_id),
          fixed_qty: new FormControl(
            item.sales_target_details[newIndex].fixed_qty
          ),
          fixed_value: new FormControl(
            item.sales_target_details[newIndex].fixed_value
          ),
          from_qty: new FormControl(
            item.sales_target_details[newIndex].from_qty
          ),
          to_qty: new FormControl(item.sales_target_details[newIndex].to_qty),
          from_value: new FormControl(
            item.sales_target_details[newIndex].from_value
          ),
          to_value: new FormControl(
            item.sales_target_details[newIndex].to_value
          ),
          commission: new FormControl(
            item.sales_target_details[newIndex].commission
          ),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(''),
          item_uom_id: new FormControl(''),
          fixed_qty: new FormControl(0),
          fixed_value: new FormControl(0),
          from_qty: new FormControl(0),
          to_qty: new FormControl(0),
          from_value: new FormControl(0),
          to_value: new FormControl(0),
          commission: new FormControl(0),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  public addHeaderForm(item?): void {
    const headerControls = this.salesTargetFormGroup.controls[
      'headers'
    ] as FormArray;
    const newIndex = headerControls.length;
    if (item) {
      headerControls.push(
        this.formBuilder.group({
          fixed_qty: new FormControl(
            item.sales_target_details[newIndex].fixed_qty
          ),
          fixed_value: new FormControl(
            item.sales_target_details[newIndex].fixed_value
          ),
          from_qty: new FormControl(
            item.sales_target_details[newIndex].from_qty
          ),
          to_qty: new FormControl(item.sales_target_details[newIndex].to_qty),
          from_value: new FormControl(
            item.sales_target_details[newIndex].from_value
          ),
          to_value: new FormControl(
            item.sales_target_details[newIndex].to_value
          ),
          commission: new FormControl(
            item.sales_target_details[newIndex].commission
          ),
        })
      );
    } else {
      headerControls.push(
        this.formBuilder.group({
          fixed_qty: new FormControl(0),
          fixed_value: new FormControl(0),
          from_qty: new FormControl(0),
          to_qty: new FormControl(0),
          from_value: new FormControl(0),
          to_value: new FormControl(0),
          commission: new FormControl(0),
        })
      );
    }
  }

  public targetOnChanged(data: MatSelectChange): void {
    this.selectedTargetId = data.value;
    this.targetOnFormControl.setValue(data.value);
  }

  public ownerChanged(data: MatSelectChange): void {
    this.selectedOwnerIds = data.value;
    this.ownerFormControl.setValue(data.value);
  }

  public goToAllDataList(): void {
    this.router.navigate(['target/sales-target']);
  }

  public addItem(): void {
    this.addItemForm();
  }

  addCategory() {

  }

  public addHeader(): void {
    this.addHeaderForm();
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public get targetControl(): TargetControl {
    this.isItemSelected =
      this.applyLevelFormControl.value === 'item' ? true : false;

    if (this.targetTypeFormControl.value === 'quantity') {
      return this.rangeTypeFormControl.value === 'fixed'
        ? TargetControl.HEAD_FIXED_QTY
        : TargetControl.HEAD_QTY;
    } else {
      return this.rangeTypeFormControl.value === 'fixed'
        ? TargetControl.HEAD_FIXED_VALUE
        : TargetControl.HEAD_VALUE;
    }
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.salesTargetFormGroup.get('items') as FormArray;
    return itemControls.controls;
  }

  public get headersFormControls(): AbstractControl[] {
    const headersControls = this.salesTargetFormGroup.get(
      'headers'
    ) as FormArray;

    return headersControls.controls;
  }

  public itemControlValue(item: Item): { id: number; name: string } {
    return { id: Number(item.id), name: item.item_name };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
  }): string | undefined {
    return item ? item.name : undefined;
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.salesTargetFormGroup.get('items') as FormArray;

    itemControls.removeAt(index);

    this.itemNameSubscriptions.splice(index, 1);
    this.itemControlSubscriptions.splice(index, 1);
  }

  public deleteHeadersRow(index: number): void {
    const headersControls = this.salesTargetFormGroup.get(
      'headers'
    ) as FormArray;
    headersControls.removeAt(index);
  }

  public itemDidSearched(data: any, index: number): void {
    const selectedItem = this.items.find(
      (item: Item) => Number(item.id) === Number(data.id)
    );
    const selectedUom = this.uoms.find(
      (uom: ItemUoms) => uom.id === Number(selectedItem.lower_unit_uom_id)
    );

    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    const uomControl = itemFormGroup.controls.item_uom_id;

    uomControl.setValue(selectedUom ? selectedUom.id : undefined);

    // this.updatePayloadItem(itemFormGroup, index);
  }

  // public updatePayloadItem(itemFormGroup: FormGroup, index: number): void {
  //   const payloadItem: SalesTargetItemDetail = {
  //     item_name: itemFormGroup.value.item.name,
  //     item_id: itemFormGroup.value.item.id,
  //     item_uom_id: itemFormGroup.value.item_uom_id,
  //     fixed_qty: itemFormGroup.value.fixed_qty,
  //     fixed_value: itemFormGroup.value.fixed_value,
  //     from_qty: itemFormGroup.value.from_qty,
  //     to_qty: itemFormGroup.value.to_qty,
  //     from_value: itemFormGroup.value.from_value,
  //     to_value: itemFormGroup.value.to_value,
  //     commission: itemFormGroup.value.commission,
  //   };
  //
  //   this.payloadItems[index] = payloadItem;
  // }

  // public updatePayloadHeaders(itemFormGroup: FormGroup, index: number): void {
  //   const payloadHeaders: SalesTargetHeaderDetail = {
  //     fixed_qty: itemFormGroup.value.fixed_qty,
  //     fixed_value: itemFormGroup.value.fixed_value,
  //     from_qty: itemFormGroup.value.from_qty,
  //     to_qty: itemFormGroup.value.to_qty,
  //     from_value: itemFormGroup.value.from_value,
  //     to_value: itemFormGroup.value.to_value,
  //     commission: itemFormGroup.value.commission,
  //   };
  //
  //   this.payloadHeaders[index] = payloadHeaders;
  // }

  public onSubmit(): void {
    // const finalPayload = {
    //   ...this.salesTargetFormGroup.value,
    // };
    // let payload;
    // if (this.applyLevelFormControl.value === 'item') {
    //   payload = this.salesTargetFormGroup.controls.items.value.map((item) => {
    //     return {
    //       item_id: item.item.id,
    //       item_name: item.item.name,
    //       item_uom_id: item.item_uom_id,
    //       saleitem: [
    //         {
    //           fixed_qty: item.fixed_qty,
    //           fixed_value: item.fixed_value,
    //           from_qty: item.from_qty,
    //           to_qty: item.to_qty,
    //           from_value: item.from_value,
    //           to_value: item.to_value,
    //           commission: item.commission,
    //         },
    //       ],
    //     };
    //   });
    // } else {
    //   payload = this.salesTargetFormGroup.controls.headers.value.map((item) => {
    //     return {
    //       item_id: 0,
    //       item_name: 0,
    //       item_uom_id: 0,
    //       saleitem: [
    //         {
    //           fixed_qty: item.fixed_qty,
    //           fixed_value: item.fixed_value,
    //           from_qty: item.from_qty,
    //           to_qty: item.to_qty,
    //           from_value: item.from_value,
    //           to_value: item.to_value,
    //           commission: item.commission,
    //         },
    //       ],
    //     };
    //   });
    // }
    // finalPayload.items = payload;
    // this.finalSalesTargetPayload = { ...finalPayload };
    // delete this.finalSalesTargetPayload['headers'];
    // this.makePostCall();
    this.close()
  }

  private initHeaderFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm) {
      return formArray;
    }

    formArray.push(
      this.formBuilder.group({
        fixed_qty: new FormControl(0),
        fixed_value: new FormControl(0),
        from_qty: new FormControl(0),
        to_qty: new FormControl(0),
        from_value: new FormControl(0),
        to_value: new FormControl(0),
        commission: new FormControl(0),
      })
    );

    return formArray;
  }
  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm) {
      return formArray;
    }

    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined),
        fixed_qty: new FormControl(0),
        fixed_value: new FormControl(0),
        from_qty: new FormControl(0),
        to_qty: new FormControl(0),
        from_value: new FormControl(0),
        to_value: new FormControl(0),
        commission: new FormControl(0),
      })
    );

    return formArray;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.salesTargetFormGroup.controls[
      'items'
    ] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    this.itemNameSubscriptions.push(
      newFormGroup.controls['item'].valueChanges
        .pipe(
          startWith<string | Item>(''),
          map((value) => (typeof value === 'string' ? value : value.item_name)),
          map((value: string) => {
            return value ? this.filterItems(value) : this.items.slice();
          })
        )
        .subscribe((result: Item[]) => {
          this.filteredItems = result;
        })
    );
  }

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();

    return this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue)
    );
  }

  makePostCall(): void {
    const {
      ApplyOn,
      CommissionType,
      TargetVariance,
      TargetType,
    } = this.finalSalesTargetPayload;
    this.finalSalesTargetPayload['ApplyOn'] = ApplyOn == 'item' ? 1 : 2;
    this.finalSalesTargetPayload['CommissionType'] =
      CommissionType == 'fixed' ? 1 : 2;
    this.finalSalesTargetPayload['TargetVariance'] =
      TargetVariance == 'fixed' ? 1 : 2;
    this.finalSalesTargetPayload['TargetType'] =
      TargetType == 'quantity' ? 1 : 2;

    if (this.isEditForm) {
      this.finalSalesTargetPayload.uuid = this.uuid;
      this.targetService
        .editSalesTarget(this.uuid, this.finalSalesTargetPayload)
        .subscribe((result) => {
          this.toaster.showSuccess(
            'Success',
            'Sales target has been updated successfuly.'
          );
          this.router.navigate(['/target/sales-target']);
        });
    } else {
      this.targetService
        .addSalesTarget(this.finalSalesTargetPayload)
        .subscribe((result) => {
          this.toaster.showSuccess(
            'Success',
            'Sales target has been added successfuly.'
          );
          this.router.navigate(['/target/sales-target']);
        });
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }

}
