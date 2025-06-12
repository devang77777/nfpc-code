import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import { DepotExpairyItemsPayload } from './../depot-expairy.model';
import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { Component, OnInit, ElementRef } from '@angular/core';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { Customer } from '../../../master/customer/customer-dt/customer-dt.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { DEPOT_EXPAIRY_TABLE_HEADS } from '../depot-expairy-detail/depot-expairy-detail.component';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { StockAdjustmentModel } from '../../stock-adjustment/stock-adjustment-model';
import {
  ItemAddTableHeader,
  OrderItemsPayload,
} from '../../../transaction/orders/order-models';
import { TempNameData } from '../../stock-adjustment/sa-form/sa-form.component';

@Component({
  selector: 'app-depot-expairy-form',
  templateUrl: './depot-expairy-form.component.html',
  styleUrls: ['./depot-expairy-form.component.scss'],
})
export class DepotExpairyFormComponent implements OnInit {
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

  public stockAdjustFormGroup: FormGroup;
  public depotFormControl: FormControl;
  public accountFormControl: FormControl;
  public reasonFormControl: FormControl;
  public dateFormControl: FormControl;
  public referenceFormControl: FormControl;
  public modeFormControl: FormControl;

  public qtyTableHeaders: ItemAddTableHeader[] = [];

  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public payloadItems: DepotExpairyItemsPayload[] = [];
  public warehouses: TempNameData[] = [];
  public reasons: TempNameData[] = [];
  public accounts: TempNameData[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedDepotId: number;
  public selectedAccountId: number;
  public selectedReasonId: number;

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
  public stockdata: any[] = [];
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
    this.isEditForm = this.router.url.includes('inventory/depot-expairy/edit/');
    this.qtyTableHeaders = DEPOT_EXPAIRY_TABLE_HEADS;
    this.selectedDepotId = this.route.snapshot.data[
      'resolved'
    ].branchDepot.data;
    this.selectedReasonId = this.route.snapshot.data['resolved'].reason.data;
    this.depotFormControl = new FormControl('', [Validators.required]);
    this.dateFormControl = new FormControl('', [Validators.required]);
    this.referenceFormControl = new FormControl('', [Validators.required]);

    this.stockAdjustFormGroup = this.formBuilder.group({
      depot_id: this.depotFormControl,
      date: this.dateFormControl,
      reference_code: this.referenceFormControl,
      items: this.initItemFormArray(),
    });

    this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;

    if (this.isEditForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Depot Expairy';
      this.stockAdjustData = this.route.snapshot.data['data'].returndata;
      this.setupEditFormControls(this.stockAdjustData);
    } else {
      this.pageTitle = 'Add Depot Expairy';
      this.addItemFilterToControl(0);
    }
    if (!this.isEditForm) {
      this.getOrderCode();
      this.referenceFormControl.enable();
    } else {
      this.referenceFormControl.disable();
    }
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
      function_for: 'depot_damage_expiry',
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
      title: 'Depot Damage Expairy Code',
      functionFor: 'depot_damage_expiry',
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
            res.data.next_coming_number_depot_damage_expiry
          );
          this.nextCommingNumberofOrderCode =
            res.data.next_coming_number_depot_damage_expiry;
          this.nextCommingNumberofOrderCodePrefix = res.reqData.prefix_code;
          this.referenceFormControl.disable();
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    this.referenceFormControl.setValue(editData.reference_code);
    this.dateFormControl.setValue(editData.date);
    this.depotFormControl.setValue(editData.depot ? editData.depot.id : '');
    editData.depotdamageexpiry_detail.forEach((item: any, index: number) => {
      this.addItemForm(item);
    });
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
          qty: new FormControl(item.qty, [Validators.required]),
          reason_id: new FormControl(item.reason[0]?.id, [Validators.required]),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          qty: new FormControl(1, [Validators.required]),
          reason_id: new FormControl(undefined, [Validators.required]),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  // public accountChanged(data: MatSelectChange): void {
  //   this.selectedAccountId = data.value;
  //   this.accountFormControl.setValue(data.value);
  // }

  public warehouseChanged(data: MatSelectChange): void {
    this.selectedDepotId = data.value;
    this.depotFormControl.setValue(data.value);
  }

  // public reasonChanged(data: MatSelectChange): void {
  //   this.selectedReasonId = data.value;
  //   this.reasonFormControl.setValue(data.value);
  // }

  // public salesmanChanged(id: number): void {
  //   this.selectedDestWarehouseId = id;
  //   this.destinationFormControl.setValue(id);
  // }

  // public payTermChanged(id: number): void {
  //   this.selectedPaymentTermId = id;
  //   this.paymentTermFormControl.setValue(id);
  //   this.setupDueDate();
  // }

  // public addCustomer(): void {
  //   this.router.navigate([ 'masters/customer/add' ]);
  // }

  public goToStockAdjustmentList(): void {
    this.router.navigate(['inventory/depot-expairy']);
  }

  // public addOrderType(): void {
  //   this.dialogRef.open(OrderTypeFormComponent, {
  //     width: '500px'
  //   }).afterClosed().subscribe(data => {
  //     //console.log(data);
  //   });
  // }

  public addItem(): void {
    this.addItemForm();
  }

  // public itemDidSelected(event: any, item: OrderItemsPayload): void {
  //   const isChecked = event.target.checked;
  //   const currentIndex = this.selectedPayloadItems.indexOf(item);
  //
  //   if (isChecked) {
  //     this.selectedPayloadItems.push(item);
  //   } else {
  //     this.selectedPayloadItems.splice(currentIndex, 1);
  //   }
  //
  //   this.generateOrderFinalStats(false, true);
  // }

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
    // let selectedItemIndex: number;
    // let isSelectedItemDelete = false;

    // if (this.selectedPayloadItems.length) {
    //   const selectedItem = this.selectedPayloadItems.find((item: OrderItemsPayload, i: number) => item.item_id === itemControls.value[index].item.id);
    //   selectedItemIndex = this.selectedPayloadItems.indexOf(selectedItem);
    //   if (selectedItemIndex >= 0) {
    //     this.selectedPayloadItems.splice(selectedItemIndex, 1);
    //     isSelectedItemDelete = true;
    //   }
    // }

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

    this.updatePayloadItem(itemFormGroup, index);
  }

  public updatePayloadItem(itemFormGroup: FormGroup, index: number): void {
    const payloadItem: DepotExpairyItemsPayload = {
      item: itemFormGroup.value.item,
      item_id: itemFormGroup.value.item.id,
      qty: itemFormGroup.value.qty,
      item_uom_id: itemFormGroup.value.item_uom_id,
      reason: itemFormGroup.value.reason_id,
      reason_id: itemFormGroup.value.reason_id,
    };

    this.payloadItems[index] = payloadItem;
  }

  public postFinalOrder(target: string): void {
    // const totalStats = {};
    // Object.keys(this.orderFinalStats).forEach((key: string) => {
    //   totalStats[key] = this.orderFinalStats[key].value;
    // });
    const finalPayload = {
      ...this.stockAdjustFormGroup.value,
    };

    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;

    this.finalGrnPayload = { ...finalPayload };
    // this.finalDeliveryPayload = { ...finalPayload };
    // this.finalDeliveryPayload.items = this.selectedPayloadItems.length ? this.selectedPayloadItems : this.payloadItems;

    // if (this.selectedPayloadItems.length) {
    //   Object.keys(this.deliveryFinalStats).forEach((key: string) => {
    //     this.finalDeliveryPayload[key] = this.deliveryFinalStats[key].value;
    //   });
    //   this.finalDeliveryPayload['total_qty'] = this.selectedPayloadItems.length;
    // }

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
        qty: new FormControl(1, [Validators.required]),
        reason_id: new FormControl(undefined, [Validators.required]),
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
      newFormGroup.valueChanges.subscribe((result) => {
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        const qty = newFormGroup.controls.qty as FormControl;

        // if (availQtyControl.value && (availQtyControl.value < result)) {
        //   const adjustedQty = Number(result) - Number(availQtyControl.value);
        //   newFormGroup.controls.adjusted_qty.setValue(adjustedQty);

        // } else if (availQtyControl.value && (availQtyControl.value > result)) {
        //   const adjustedQty = Number(availQtyControl.value) - Number(result);
        //   newFormGroup.controls.adjusted_qty.setValue(adjustedQty);

        // }

        this.updatePayloadItem(newFormGroup, groupIndex);
      })
    );

    // this.itemControlSubscriptions.push(newFormGroup.controls.new_value.valueChanges.subscribe(result => {
    //   const groupIndex = itemControls.controls.indexOf(newFormGroup);
    //   const availValueControl = newFormGroup.controls.available_value as FormControl;

    //   if (availValueControl.value && (availValueControl.value < result)) {
    //     const adjustedValue = Number(result) - Number(availValueControl.value);
    //     newFormGroup.controls.adjusted_value.setValue(adjustedValue);

    //   } else if (availValueControl.value && (availValueControl.value > result)) {
    //     const adjustedValue = Number(availValueControl.value) - Number(result);
    //     newFormGroup.controls.adjusted_value.setValue(adjustedValue);

    //   }

    //   this.updatePayloadItem(newFormGroup, groupIndex);
    // }));
  }

  // private setupDueDate(): void {
  //   const selectedTerm = this.terms.find((term: PaymentTerms) => term.id === this.selectedPaymentTermId);
  //   const newDate = formatDate(new Date(Date.now() + (selectedTerm.number_of_days * 86400000)), 'yyyy-MM-dd', 'en');
  //
  //   this.dateFormControl.setValue(newDate);
  // }

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();

    return this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue)
    );
  }

  // private filterCustomers(customerName: string): Customer[] {
  //   const filterValue = customerName.toLowerCase();
  //
  //   return this.customers.filter(customer => customer.user.firstname.toLowerCase().includes(filterValue) || customer.user.lastname.toLowerCase().includes(filterValue));
  // }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  public checkFormValidation(): boolean {
    // if (this.orderFormGroup.invalid) {
    //   const invalidControl = Object.keys(this.orderFormGroup.controls).find((key: string) => {
    //     return this.orderFormGroup.controls[key].invalid;
    //   });
    //   const invalidElem = this.elemRef.nativeElement.querySelector(`formControlName=${invalidControl}`);
    //   invalidElem.focus();
    //
    //   return;
    // }

    // if (!this.isDepotOrder && this.depotFormControl.invalid) {
    //   Utils.setFocusOn('sourceFormField');

    //   return false;
    // }

    // if (this.isDepotOrder && this.accountFormControl.invalid) {
    //   Utils.setFocusOn('destFormField');

    //   return false;
    // }

    if (this.dateFormControl.invalid) {
      Utils.setFocusOn('grnDate');

      return false;
    }

    return true;
  }

  // private generateOrderFinalStats(isDeleted?: boolean, isItemSelection?: boolean): void {
  //   if (isItemSelection) {
  //     Object.values(this.deliveryFinalStats).forEach(item => {
  //       item.value = 0;
  //     });
  //
  //     this.selectedPayloadItems.forEach((item: OrderItemsPayload) => {
  //       this.sumUpFinalStats(item, true);
  //     });
  //
  //     if (!isDeleted) {
  //       return;
  //     }
  //   }
  //
  //   Object.values(this.orderFinalStats).forEach(item => {
  //     item.value = 0;
  //   });
  //
  //   this.payloadItems.forEach((item: OrderItemsPayload) => {
  //     this.sumUpFinalStats(item);
  //   });
  // }

  // private sumUpFinalStats(item: OrderItemsPayload, isForDelivery?: boolean): void {
  //
  //   if (isForDelivery) {
  //     this.deliveryFinalStats.gross_total.value = this.deliveryFinalStats.gross_total.value + item.item_grand_total;
  //     this.deliveryFinalStats.total_vat.value = this.deliveryFinalStats.total_vat.value + item.item_vat;
  //     this.deliveryFinalStats.total_excise.value = this.deliveryFinalStats.total_excise.value + item.item_excise;
  //     this.deliveryFinalStats.total_net.value = this.deliveryFinalStats.total_net.value + item.item_net;
  //     this.deliveryFinalStats.total_discount_amount.value = this.deliveryFinalStats.total_discount_amount.value + item.item_discount_amount;
  //     this.deliveryFinalStats.grand_total.value = this.deliveryFinalStats.grand_total.value + item.item_grand_total;
  //
  //     return;
  //   }
  //
  //   this.orderFinalStats.gross_total.value = this.orderFinalStats.gross_total.value + item.item_grand_total;
  //   this.orderFinalStats.total_vat.value = this.orderFinalStats.total_vat.value + item.item_vat;
  //   this.orderFinalStats.total_excise.value = this.orderFinalStats.total_excise.value + item.item_excise;
  //   this.orderFinalStats.total_net.value = this.orderFinalStats.total_net.value + item.item_net;
  //   this.orderFinalStats.total_discount_amount.value = this.orderFinalStats.total_discount_amount.value + item.item_discount_amount;
  //   this.orderFinalStats.grand_total.value = this.orderFinalStats.grand_total.value + item.item_grand_total;
  // }

  private setupPayloadItemArray(form: FormGroup): DepotExpairyItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_uom_id: form.controls.item_uom_id.value,
      qty: form.controls.qty.value,
      reason: form.controls.reason_id.value,
      reason_id: form.controls.reason_id.value,
      // discount_id: result ? result.discount_id : null,
      // promotion_id: result ? result.promotion_id : null,
      // is_free: result ? result.is_free : false,
      // is_item_poi: result ? result.is_item_poi : false,
      // item_price: result ? Number(result.item_price) : 0,
      // item_discount_amount: result ? Number(result.discount) : 0,
      // item_vat: result ? Number(result.total_vat) : 0,
      // item_net: result ? Number(result.total_net) : 0,
      // item_excise: result ? Number(result.total_excise) : 0,
      // item_grand_total: result ? Number(result.total) : 0
    };
  }

  private makeOrderPostCall(target: string): void {
    if (target === 'draft' || target === 'adjustment') {
      if (this.isEditForm) {
        this.finalGrnPayload[
          'reference_code'
        ] = this.referenceFormControl.value;
        this.subscriptions.push(
          this.apiService
            .editDepotExpairyGoods(
              this.stockAdjustData.uuid,
              this.finalGrnPayload
            )
            .subscribe((result) => {
              this.CommonToasterService.showSuccess(
                '',
                'Edited Successfully!Please check the table'
              );
              //console.log('Order edited', result.data);
              this.router.navigate(['inventory/depot-expairy']);
            })
        );
      } else {
        this.finalGrnPayload[
          'reference_code'
        ] = this.referenceFormControl.value;
        this.subscriptions.push(
          this.apiService
            .AddDepotExpairyGoods(this.finalGrnPayload)
            .subscribe((result) => {
              this.CommonToasterService.showSuccess(
                '',
                'Added Successfully!Please check the table'
              );
              //console.log('Order added', result.data);
              this.router.navigate(['inventory/depot-expairy']);
            })
        );
      }
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
