import { ReasonFormComponent } from './../../../../dialog-forms/reason-form/reason-form.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { map, startWith } from 'rxjs/operators';
import {
  StockAdjustmentModel,
  StockAdjustItemsPayload,
} from '../stock-adjustment-model';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import {
  ItemAddTableHeader,
  OrderItemsPayload,
} from 'src/app/components/main/transaction/orders/order-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sa-form',
  templateUrl: './sa-form.component.html',
  styleUrls: ['./sa-form.component.scss'],
})
export class SaFormComponent implements OnInit, OnDestroy {
  public pageTitle: string;
  public isEditForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public grnNumber: string;
  public nextOrderNumber: string;
  public stockAdjustData: StockAdjustmentModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public stockAdjstDetailCount: number = 0;
  public stockAdjstItemid: number[] = [];
  public stockAdjustFormGroup: FormGroup;
  public warehouseFormControl: FormControl;
  public accountFormControl: FormControl;
  public reasonFormControl: FormControl;
  public descriptionFormControl: FormControl;
  public dateFormControl: FormControl;
  public referenceFormControl: FormControl;
  public modeFormControl: FormControl;
  public enableCTA: boolean = false;
  public qtyTableHeaders: ItemAddTableHeader[] = [];
  public valueTableHeaders: ItemAddTableHeader[] = [];

  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public payloadItems: StockAdjustItemsPayload[] = [];
  public warehouses: TempNameData[] = [];
  public reasons: TempNameData[] = [];
  public accounts: TempNameData[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedWarehouseId: number;
  public selectedAccountId: number;
  public selectedReasonId: number;
  public selectedReasonData: any;
  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private elemRef: ElementRef;
  private finalGrnPayload: any = {};
  public warehousedata: any[] = [];
  public reasondata: any[] = [];
  public stockdata: any[] = [];
  public account: any[] = [];
  public nextCommingNumberofOrderCode: string;
  nextCommingNumberofOrderCodePrefix: any;
  constructor(
    apiService: ApiService,
    dataService: DataEditor,
    private CommonToasterService: CommonToasterService,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      elemRef,
      formBuilder,
      router,
      route,
    });
  }

  public ngOnInit(): void {
    this.isEditForm = this.router.url.includes('stock-adjustment/edit/');
    this.buildForm();
    this.qtyTableHeaders = QTY_STOCK_ADJUST_TABLE_HEADS;
    this.valueTableHeaders = VALUE_STOCK_ADJUST_TABLE_HEADS;
    this.warehousedata = this.route.snapshot.data['resolved'].warehouse.data;
    this.reasondata = this.route.snapshot.data['resolved'].reason.data;
    this.account = this.route.snapshot.data['resolved'].account.data;

    this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;

    if (this.isEditForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Stock Adjustment';
      this.stockAdjustData = this.route.snapshot.data['stock'].returnStock;
      if (this.stockAdjustData[0].status === 'Adjustment') {
        this.enableCTA = true;
      }
      this.setupEditFormControls(this.stockAdjustData[0]);
    } else {
      this.pageTitle = 'Add Stock Adjustment';
      this.addItemFilterToControl(0);
    }

    this.subscriptions.push(
      this.apiService.getWarehouses().subscribe((result) => {
        this.warehouses = result.data;
      })
    );

    this.subscriptions.push(
      this.apiService.getReturnReasons().subscribe((result) => {
        this.reasons = result.data;
      })
    );

    this.subscriptions.push(
      this.apiService.getAccounts().subscribe((result) => {
        this.accounts = result.data;
      })
    );
    if (!this.isEditForm) {
      this.getOrderCode();
      this.referenceFormControl.enable();
    } else {
      this.referenceFormControl.disable();
    }
  }

  buildForm() {
    this.warehouseFormControl = new FormControl(this.selectedWarehouseId, [
      Validators.required,
    ]);
    this.accountFormControl = new FormControl(this.selectedAccountId, [
      Validators.required,
    ]);
    this.reasonFormControl = new FormControl('', [Validators.required]);
    this.descriptionFormControl = new FormControl('', [Validators.required]);
    this.dateFormControl = new FormControl('', [Validators.required]);
    this.referenceFormControl = new FormControl('', [Validators.required]);
    this.modeFormControl = new FormControl('quantity', [Validators.required]);

    this.stockAdjustFormGroup = new FormGroup({
      warehouse_id: this.warehouseFormControl,
      account_id: this.accountFormControl,
      reason_id: this.reasonFormControl,
      adjustment_mode: this.modeFormControl,
      description: this.descriptionFormControl,
      stock_adjustment_date: this.dateFormControl,
      reference_number: this.referenceFormControl,
      items: this.initItemFormArray(),
    });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  public get modeOfAdjustment(): string {
    return this.modeFormControl.value;
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'stock_adjustment',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofOrderCode = res.data.number_is;
        this.nextCommingNumberofOrderCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofOrderCode) {
          this.referenceFormControl.setValue(this.nextCommingNumberofOrderCode);
          this.referenceFormControl.disable();
        } else if (this.nextCommingNumberofOrderCode == null) {
          this.nextCommingNumberofOrderCode = '';
          this.referenceFormControl.enable();
        }
      } else {
        this.nextCommingNumberofOrderCode = '';
        this.referenceFormControl.enable();
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Stock Adjustment Code',
      functionFor: 'stock_adjustment',
      code: this.nextCommingNumberofOrderCode,
      prefix: this.nextCommingNumberofOrderCodePrefix,
      key: this.nextCommingNumberofOrderCode.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.referenceFormControl.setValue('');
          this.nextCommingNumberofOrderCode = '';
          this.referenceFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          //this.grnNumber = res.data.next_coming_number_goodreceiptnote
          this.referenceFormControl.setValue(
            res.data.next_coming_number_stock_adjustment
          );
          this.nextCommingNumberofOrderCode =
            res.data.next_coming_number_stock_adjustment;
          this.nextCommingNumberofOrderCodePrefix = res.reqData.prefix_code;
          this.referenceFormControl.disable();
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    this.selectedWarehouseId = editData.warehouse?.id;
    this.selectedAccountId = editData.account?.id;
    this.warehouseFormControl.setValue(editData.warehouse?.id);
    this.accountFormControl.setValue(editData.accounts?.id);
    this.modeFormControl.setValue(editData.adjustment_mode);
    this.descriptionFormControl.setValue(editData.description);
    this.dateFormControl.setValue(editData.stock_adjustment_date);
    this.referenceFormControl.setValue(editData.reference_number);
    this.reasonFormControl.setValue(editData.reason_id);
    this.selectedReasonData = editData.reason;
    this.stockAdjstDetailCount = editData.stockadjustmentdetail.length;
    editData.stockadjustmentdetail.forEach(
      (item: StockAdjustItemsPayload, index: number) => {
        this.stockAdjstItemid.push(item.id);
        this.addItemForm(item);
      }
    );
  }

  public addItemForm(item?: any): void {
    const itemControls = this.stockAdjustFormGroup.controls[
      'items'
    ] as FormArray;

    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(
            { id: item.item[0]?.id, name: item.item[0]?.item_name },
            [Validators.required]
          ),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          available_qty: new FormControl(item.available_qty),
          new_qty: new FormControl(item.new_qty),
          adjusted_qty: new FormControl(item.adjusted_qty),
          available_value: new FormControl(item.available_value),
          new_value: new FormControl(item.new_value),
          adjusted_value: new FormControl(item.adjusted_value),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          available_qty: new FormControl(0),
          new_qty: new FormControl(0),
          adjusted_qty: new FormControl(0),
          available_value: new FormControl(0),
          new_value: new FormControl(0),
          adjusted_value: new FormControl(0),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  public accountChanged(data: MatSelectChange): void {
    this.selectedAccountId = data.value;
    this.accountFormControl.setValue(data.value);
  }

  public warehouseChanged(data: MatSelectChange): void {
    this.selectedWarehouseId = data.value;
    this.warehouseFormControl.setValue(data.value);
  }

  public goToStockAdjustmentList(): void {
    this.router.navigate(['inventory/stock-adjustment']);
  }

  public addItem(): void {
    this.addItemForm();
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.stockAdjustFormGroup.get('items') as FormArray;

    return itemControls.controls;
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

  public customerControlDisplayValue(customer: Customer): string {
    return customer
      ? `${customer.user.firstname} ${customer.user.lastname}`
      : '';
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.stockAdjustFormGroup.get('items') as FormArray;
    itemControls.removeAt(index);
    this.itemNameSubscriptions.splice(index, 1);
    this.itemControlSubscriptions.splice(index, 1);
    this.payloadItems.splice(index, 1);
  }

  public itemDidSearched(data: any, index: number): void {
    const selectedItem = this.items.find((item: Item) => item.id === data.id);
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    const uomControl = itemFormGroup.controls.item_uom_id;

    uomControl.setValue(selectedItem.lower_unit_uom_id);

    const availQtyControl = itemFormGroup.controls.available_qty;
    const availValueControl = itemFormGroup.controls.available_value;
    availQtyControl.setValue(selectedItem.available_qty || 1000);
    availValueControl.setValue(selectedItem.available_value || 1000);

    this.updatePayloadItem(itemFormGroup, index);
  }

  public updatePayloadItem(itemFormGroup: FormGroup, index: number): void {
    const payloadItem: StockAdjustItemsPayload = {
      item: itemFormGroup.value.item,
      item_id: itemFormGroup.value.item.id,
      item_uom_id: itemFormGroup.value.item_uom_id,
      new_qty: itemFormGroup.value.new_qty,
      available_qty: itemFormGroup.value.available_qty,
      adjusted_qty: itemFormGroup.value.adjusted_qty,
      new_value: itemFormGroup.value.new_value,
      available_value: itemFormGroup.value.available_value,
      adjusted_value: itemFormGroup.value.adjusted_value,
    };

    this.payloadItems[index] = payloadItem;
  }

  public postFinalOrder(target: string): void {
    const finalPayload = {
      ...this.stockAdjustFormGroup.value,
    };
    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;

    this.finalGrnPayload = { ...finalPayload };
    this.makeOrderPostCall(target);
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
        available_qty: new FormControl(0),
        new_qty: new FormControl(0),
        adjusted_qty: new FormControl(0),
        available_value: new FormControl(0),
        new_value: new FormControl(0),
        adjusted_value: new FormControl(0),
      })
    );

    return formArray;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.stockAdjustFormGroup.controls[
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

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.controls.new_qty.valueChanges.subscribe((result) => {
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        const availQtyControl = newFormGroup.controls
          .available_qty as FormControl;

        if (+availQtyControl.value && +availQtyControl.value < +result) {
          const adjustedQty = +availQtyControl.value - +result;
          newFormGroup.controls.adjusted_qty.setValue(adjustedQty);
        } else if (
          +availQtyControl.value &&
          +availQtyControl.value >= +result
        ) {
          const adjustedQty = +availQtyControl.value - +result;
          newFormGroup.controls.adjusted_qty.setValue(+adjustedQty);
        }

        this.updatePayloadItem(newFormGroup, groupIndex);
      })
    );
  }

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();

    return this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue)
    );
  }

  public checkFormValidation(): boolean {
    if (this.dateFormControl.invalid) {
      Utils.setFocusOn('grnDate');

      return false;
    }

    return true;
  }

  public salesOrganisationSelected(data: any): void {
    this.reasonFormControl.setValue(data.id);
  }

  public openChannel(): void {
    this.dialogRef
      .open(ReasonFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.apiService
          .getReasonlist()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((channels) => {
            this.reasondata = channels;
          });
        if (!result) {
          return;
        }
        this.reasonFormControl.setValue(result.id);
      });
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  public salesOrganisationProvider(): Observable<any[]> {
    return this.apiService.getReasonlist().pipe(map((result) => result.data));
  }

  private setupPayloadItemArray(form: FormGroup): StockAdjustItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_uom_id: form.controls.item_uom_id.value,
      available_qty: form.controls.available_qty.value,
      new_qty: form.controls.new_qty.value,
      adjusted_qty: form.controls.adjusted_qty.value,
      available_value: form.controls.available_value.value,
      new_value: form.controls.new_value.value,
      adjusted_value: form.controls.adjusted_value.value,
    };
  }

  private makeOrderPostCall(target: string): void {
    var is_Check = [];
    is_Check = this.finalGrnPayload.items;
    var valueArr = is_Check.map(function (item) {
      return item.item_id;
    });
    var isDuplicate = valueArr.some(function (item, idx) {
      return valueArr.indexOf(item) != idx;
    });

    if (!isDuplicate) {
      if (target === 'Draft') {
        if (this.isEditForm) {
          this.finalGrnPayload.items.forEach((item, i) => {
            if (i < this.stockAdjstDetailCount) {
              item['id'] = this.stockAdjstItemid[i];
            } else if (i > this.stockAdjstDetailCount - 1) {
              item['id'] = 0;
            }
          });
          this.finalGrnPayload[
            'reference_number'
          ] = this.referenceFormControl.value;
          this.finalGrnPayload['status'] = target;
          this.subscriptions.push(
            this.apiService
              .editStockAdjustment(
                this.stockAdjustData[0].uuid,
                this.finalGrnPayload
              )
              .subscribe((result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Edited Successfully!Please check the table'
                );
                //console.log('Order edited', result.data);
                this.router.navigate(['inventory/stock-adjustment']);
              })
          );
        } else {
          this.finalGrnPayload[
            'reference_number'
          ] = this.referenceFormControl.value;
          this.finalGrnPayload['status'] = target;
          this.subscriptions.push(
            this.apiService
              .addStockAdjustment(this.finalGrnPayload)
              .subscribe((result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Added Successfully!Please check the table'
                );
                //console.log('Order added', result.data);
                this.router.navigate(['inventory/stock-adjustment']);
              })
          );
        }
      }
      if (target === 'Adjustment') {
        if (this.isEditForm) {
          this.finalGrnPayload.items.forEach((item, i) => {
            if (i < this.stockAdjstDetailCount) {
              item['id'] = this.stockAdjstItemid[i];
            } else if (i > this.stockAdjstDetailCount - 1) {
              item['id'] = 0;
            }
          });
          this.finalGrnPayload[
            'reference_number'
          ] = this.referenceFormControl.value;
          this.finalGrnPayload['status'] = target;
          this.subscriptions.push(
            this.apiService
              .editStockAdjustment(
                this.stockAdjustData[0].uuid,
                this.finalGrnPayload
              )
              .subscribe((result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Coverted to Adjustemnt Successfully!Please check the table'
                );
                //console.log('Order edited', result.data);
                this.router.navigate(['inventory/stock-adjustment']);
              })
          );
        } else {
          this.finalGrnPayload[
            'reference_number'
          ] = this.referenceFormControl.value;
          this.finalGrnPayload['status'] = target;
          this.subscriptions.push(
            this.apiService
              .addStockAdjustment(this.finalGrnPayload)
              .subscribe((result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Added Successfully!Please check the table'
                );
                //console.log('Order added', result.data);
                this.router.navigate(['inventory/stock-adjustment']);
              })
          );
        }
      }
    } else {
      this.CommonToasterService.showWarning('', 'Same Item cannot be placed');
      return;
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}

export const QTY_STOCK_ADJUST_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#' },
  { id: 1, key: 'item', label: 'Item Name' },
  { id: 2, key: 'uom', label: 'UOM' },
  { id: 3, key: 'avail_qty', label: 'Available Qty' },
  { id: 4, key: 'new_qty', label: 'New Qty' },
  { id: 5, key: 'adj_qty', label: 'Adjusted Qty' },
];

export const VALUE_STOCK_ADJUST_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#' },
  { id: 1, key: 'item', label: 'Item Name' },
  { id: 2, key: 'uom', label: 'UOM' },
  { id: 3, key: 'avail_value', label: 'Available Value' },
  { id: 4, key: 'new_value', label: 'New Value' },
  { id: 5, key: 'adj_value', label: 'Adjusted Value' },
];

export interface TempNameData {
  id: number;
  name: string;
}
