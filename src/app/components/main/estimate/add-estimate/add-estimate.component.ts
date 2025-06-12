import { Subscription } from 'rxjs';
import { Component, OnInit, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AddSalespersonComponent } from 'src/app/components/dialogs/add-salesperson/add-salesperson.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { PurchaseOrderModel } from '../../inventory/purchase-order/purchase-order-model';
import { Customer } from '../../master/customer/customer-dt/customer-dt.component';
import { Item } from '../../master/item/item-dt/item-dt.component';
import { VendorData } from '../../master/vendor/vendor-dt-page/vendor-dt-page.component';
import { ItemUoms } from '../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { BranchDepotMaster } from '../../settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { ITEM_ADD_FORM_TABLE_HEADS } from '../../transaction/orders/order-form/order-form.component';
import { map, startWith } from 'rxjs/operators';

import { CommonToasterService } from '../../../../services/common-toaster.service';
import {
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  ApiItemPriceStats,
} from '../../transaction/orders/order-models';

@Component({
  selector: 'app-add-estimate',
  templateUrl: './add-estimate.component.html',
  styleUrls: ['./add-estimate.component.scss'],
})
export class AddEstimateComponent implements OnInit {
  public pageTitle: string;
  public isEditForm: boolean;
  public isDeliveryForm: boolean;
  public uuid: string;
  public nextOrderNumber: string;
  public purchaseOrderData: PurchaseOrderModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public storePurchas: any[] = [];
  public orderFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      gross_total: { label: 'Gross Total', value: 0 },
      vat_total: { label: 'Vat', value: 0 },
      excise_total: { label: 'Excise', value: 0 },
      net_total: { label: 'Net Total', value: 0 },
      discount_total: { label: 'Discount', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };
  public deliveryFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      gross_total: { label: 'Gross Total', value: 0 },
      vat_total: { label: 'Vat', value: 0 },
      excise_total: { label: 'Excise', value: 0 },
      net_total: { label: 'Net Total', value: 0 },
      discount_total: { label: 'Discount', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };

  public orderFormGroup: FormGroup;
  public customerFormcontrol: FormControl;
  public referenceFormControl: FormControl;
  public noteFormControl: FormControl;
  public orderDateFormControl: FormControl;
  public deliveryDateFormControl: FormControl;
  public poNumberFormControl: FormControl;

  public itemTableHeaders: ItemAddTableHeader[] = [];

  public orderTypes: OrderType[] = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];
  public subjectFormControl: FormControl;
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  private router: Router;
  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private finalOrderPayload: any = {};
  private finalDeliveryPayload: any = {};
  public nextCommingNumberofOrderCode: string;
  public salesPersonFormControl: FormControl;
  public salesman: any[] = [];
  nextCommingNumberofOrderCodePrefix: any;
  constructor(
    apiService: ApiService,
    private CommonToasterService: CommonToasterService,
    dataService: DataEditor,
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
    this.isEditForm = this.router.url.includes('estimate/edit/');
    this.isDeliveryForm = this.router.url.includes('order/start-delivery/');
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;

    this.referenceFormControl = new FormControl('', [Validators.required]);
    this.customerFormcontrol = new FormControl('', [Validators.required]);
    this.noteFormControl = new FormControl('', [Validators.required]);
    this.orderDateFormControl = new FormControl('', [Validators.required]);
    this.deliveryDateFormControl = new FormControl('', [Validators.required]);
    this.poNumberFormControl = new FormControl('');
    this.salesPersonFormControl = new FormControl('', [Validators.required]);
    this.subjectFormControl = new FormControl('', [Validators.required]);
    this.orderFormGroup = this.formBuilder.group({
      customer_id: this.customerFormcontrol,
      customer_note: this.noteFormControl,
      estimate_date: this.orderDateFormControl,
      expairy_date: this.deliveryDateFormControl,
      estimate_code: this.poNumberFormControl,
      reference: this.referenceFormControl,
      subject: this.subjectFormControl,
      salesperson_id: this.salesPersonFormControl,
      items: this.initItemFormArray(),
    });
    this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    this.customers = this.route.snapshot.data['resolved'].customers.data;
    this.salesman = this.route.snapshot.data['resolved'].salesperson.data;
    // if(!this.salesman.length)
    // {
    //   this.CommonToasterService.showWarning("","Please Add SalesPerson");
    //   this.router.navigate(['salesperson']);
    // }

    if (this.isEditForm || this.isDeliveryForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = this.isEditForm ? 'Edit Estimate' : '';
      this.purchaseOrderData = this.route.snapshot.data[
        'purchase_order'
      ].returndata;
      this.setupEditFormControls(this.purchaseOrderData);
    } else {
      this.pageTitle = 'Add Estimate';
      this.addItemFilterToControl(0);
    }

    // this.subscriptions.push(this.customerFormcontrol.valueChanges.pipe(
    //   startWith<string | VendorData>(''),
    //   map(value => typeof value === 'string' ? value : value?.firstname + ' ' + value?.lastname),
    //   map((value: string) => {
    //     return value.length ? this.filterCustomers(value) : this.customers.slice();
    //   })
    // ).subscribe(value => {
    //   this.filteredCustomers = value;
    // }));
    if (!this.isEditForm) {
      this.getOrderCode();
      this.poNumberFormControl.enable();
    } else {
      this.poNumberFormControl.disable();
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'estimate',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofOrderCode = res.data.number_is;
        this.nextCommingNumberofOrderCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofOrderCode) {
          this.poNumberFormControl.setValue(this.nextCommingNumberofOrderCode);
          this.poNumberFormControl.disable();
        } else if (this.nextCommingNumberofOrderCode == null) {
          this.nextCommingNumberofOrderCode = '';
          this.poNumberFormControl.enable();
        }
      } else {
        this.nextCommingNumberofOrderCode = '';
        this.poNumberFormControl.enable();
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Estimate Code',
      functionFor: 'estimate',
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
          this.poNumberFormControl.setValue('');
          this.nextCommingNumberofOrderCode = '';
          this.poNumberFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.poNumberFormControl.setValue(
            res.data.next_coming_number_estimate
          );
          this.nextCommingNumberofOrderCode =
            res.data.next_coming_number_estimate;
          this.nextCommingNumberofOrderCodePrefix = res.reqData.prefix_code;
          this.poNumberFormControl.disable();
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    // const customer = this.customers.find(cust => cust.id === editData[0].vendor_id);
    // this.filteredCustomers.push(customer);

    // this.customerFormcontrol.setValue(customer);
    this.noteFormControl.setValue(editData.customer_note);
    this.orderDateFormControl.setValue(editData.estimate_date);
    this.deliveryDateFormControl.setValue(editData.expairy_date);
    this.referenceFormControl.setValue(editData.reference);
    this.poNumberFormControl.setValue(editData.estimate_code);
    this.subjectFormControl.setValue(editData.subject);
    this.salesPersonFormControl.setValue(editData.salesperson?.id);
    this.customerFormcontrol.setValue(editData.customer_info?.id);
    editData.estimationdetail.forEach(
      (item: OrderItemsPayload, index: number) => {
        this.addItemForm(item);
        const itemStats = this.payloadItems[index];
        Object.keys(this.payloadItems[index]).forEach((key) => {
          itemStats[key] = +item[key];
        });
      }
    );

    Object.keys(this.orderFinalStats).forEach(() => {
      //this.orderFinalStats[key].value = editData[key];
      this.orderFinalStats['discount_total'].value = +editData['discount'];
      this.orderFinalStats['vat_total'].value = +editData['vat'];
      this.orderFinalStats['gross_total'].value = +editData['gross_total'];
      this.orderFinalStats['net_total'].value = +editData['net_total'];
      this.orderFinalStats['grand_total'].value = +editData['total'];
      this.orderFinalStats['excise_total'].value = +editData['exise'];
    });
  }

  public addItemForm(item?: any): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;

    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(
            { id: item.item.id, name: item.item.item_name },
            [Validators.required]
          ),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          item_qty: new FormControl(item.item_qty, [Validators.required]),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          item_qty: new FormControl(1, [Validators.required]),
        })
      );
    }
    this.addItemFilterToControl(itemControls.controls.length - 1);
  }
  public addCustomer(): void {
    this.router.navigate(['masters/vendor']);
  }

  public goToOrder(): void {
    this.router.navigate(['/estimate']);
  }

  public addOrderType(): void {
    this.router.navigate(['masters/customer']);
  }
  addsalesperson() {
    this.dialogRef
      .open(AddSalespersonComponent, {
        width: '500px',
        height: 'auto',
      })
      .componentInstance.addPaymentTerms.subscribe((res: any) => {
        if (res) {
          this.salesman.push(res);
        }
      });
  }

  public addItem(): void {
    this.addItemForm();
  }

  public itemDidSelected(event: any, item: OrderItemsPayload): void {
    const isChecked = event.target.checked;
    const currentIndex = this.selectedPayloadItems.indexOf(item);

    if (isChecked) {
      this.selectedPayloadItems.push(item);
    } else {
      this.selectedPayloadItems.splice(currentIndex, 1);
    }

    this.generateOrderFinalStats(false, true);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.orderFormGroup.get('items') as FormArray;

    return itemControls.controls;
  }

  public itemControlValue(item: Item): { id: string; name: string } {
    return { id: item.id, name: item.item_name };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
  }): string | undefined {
    return item ? item.name : undefined;
  }

  public customerControlDisplayValue(customer: VendorData): string {
    return customer ? customer?.firstname + ' ' + customer?.lastname : '';
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.orderFormGroup.get('items') as FormArray;
    let selectedItemIndex: number;
    let isSelectedItemDelete = false;

    if (this.selectedPayloadItems.length) {
      const selectedItem = this.selectedPayloadItems.find(
        (item: OrderItemsPayload) =>
          item.item_id === itemControls.value[index].item.id
      );
      selectedItemIndex = this.selectedPayloadItems.indexOf(selectedItem);
      if (selectedItemIndex >= 0) {
        this.selectedPayloadItems.splice(selectedItemIndex, 1);
        isSelectedItemDelete = true;
      }
    }

    itemControls.removeAt(index);

    this.itemNameSubscriptions.splice(index, 1);
    this.itemControlSubscriptions.splice(index, 1);
    this.payloadItems.splice(index, 1);
    this.generateOrderFinalStats(true, isSelectedItemDelete);
  }

  public itemDidSearched(data: any, index: number): void {
    const selectedItem = this.items.find((item: Item) => item.id === data.id);
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    const uomControl = itemFormGroup.controls.item_uom_id;

    uomControl.setValue(selectedItem.lower_unit_uom_id);
  }
  public postFinalOrder(target: string): void {
    const totalStats = {};
    Object.keys(this.orderFinalStats).forEach(() => {
      totalStats['vat'] = this.orderFinalStats['vat_total'].value;
      totalStats['gross_total'] = this.orderFinalStats['gross_total'].value;
      totalStats['exise'] = this.orderFinalStats['excise_total'].value;
      totalStats['net_total'] = this.orderFinalStats['net_total'].value;
      totalStats['total'] = this.orderFinalStats['grand_total'].value;
      totalStats['discount'] = this.orderFinalStats['discount_total'].value;
    });
    const finalPayload = {
      customer_id: this.customerFormcontrol.value.id,
      ...this.orderFormGroup.value,
      ...totalStats,
      source: 3,
    };
    const newpayLoad = [];
    this.payloadItems.forEach((result) => {
      const obj = {
        item: result.item,
        item_id: result.item_id,
        item_qty: result.item_qty,
        item_uom_id: result.item_uom_id,
        promotion: result.promotion_id,
        is_free: result.is_free,
        is_item_poi: result.is_item_poi,
        item_price: result.item_price,
        item_discount_amount: result.item_discount_amount,
        item_vat: result.item_vat,
        item_net: result.item_net,
        item_excise: result.item_excise,
        item_grand_total: result.item_grand_total,
        item_gross: result.item_gross,
      };
      newpayLoad.push(obj);
    });

    finalPayload.items = newpayLoad;
    finalPayload['total_qty'] = finalPayload.items.length;

    this.finalOrderPayload = { ...finalPayload };
    this.finalDeliveryPayload = { ...finalPayload };
    this.finalDeliveryPayload.items = this.selectedPayloadItems.length
      ? this.selectedPayloadItems
      : this.payloadItems;

    if (this.selectedPayloadItems.length) {
      Object.keys(this.deliveryFinalStats).forEach((key: string) => {
        this.finalDeliveryPayload[key] = this.deliveryFinalStats[key].value;
      });
      this.finalDeliveryPayload['total_qty'] = this.selectedPayloadItems.length;
    }

    this.makeOrderPostCall(target);
  }
  orderTypeChanged(data) {
    //console.log(data);
  }
  goBackToOrdersList() {
    this.router.navigate(['/estimate']);
  }
  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm || this.isDeliveryForm) {
      return formArray;
    }

    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        item_qty: new FormControl(1, [Validators.required]),
      })
    );

    return formArray;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
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

        if (
          newFormGroup.controls['item'].value &&
          newFormGroup.controls['item_uom_id'].value
        ) {
          const body: any = {
            item_id: result.item.id,
            item_uom_id: result.item_uom_id,
            item_qty: result.item_qty,
            customer_id: null,
          };
          this.subscriptions.push(
            this.apiService.getOrderItemStats(body).subscribe((stats) => {
              this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                newFormGroup,
                stats.data
              );
              this.generateOrderFinalStats(false, false);
            })
          );
        } else {
          this.payloadItems[groupIndex] = this.setupPayloadItemArray(
            newFormGroup
          );
          this.generateOrderFinalStats(false, false);
        }
      })
    );
  }

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();

    return this.items.filter((item) =>
      item?.item_name.toLowerCase().includes(filterValue)
    );
  }

  public checkFormValidation(): boolean {
    if (this.customerFormcontrol.invalid) {
      Utils.setFocusOn('vendorFormField');
      return false;
    }
    return true;
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  private generateOrderFinalStats(
    isDeleted?: boolean,
    isItemSelection?: boolean
  ): void {
    if (isItemSelection) {
      Object.values(this.deliveryFinalStats).forEach((item) => {
        item.value = 0;
      });

      this.selectedPayloadItems.forEach((item: OrderItemsPayload) => {
        this.sumUpFinalStats(item, true);
      });

      if (!isDeleted) {
        return;
      }
    }

    Object.values(this.orderFinalStats).forEach((item) => {
      item.value = 0;
    });

    this.payloadItems.forEach((item: OrderItemsPayload) => {
      this.sumUpFinalStats(item);
    });
  }

  private sumUpFinalStats(
    item: OrderItemsPayload,
    isForDelivery?: boolean
  ): void {
    if (isForDelivery) {
      this.deliveryFinalStats.gross_total.value =
        this.deliveryFinalStats.gross_total.value + item.item_grand_total;
      this.deliveryFinalStats.vat_total.value =
        this.deliveryFinalStats.total_vat.value + item.item_vat;
      this.deliveryFinalStats.excise_total.value =
        this.deliveryFinalStats.total_excise.value + item.item_excise;
      this.deliveryFinalStats.net_total.value =
        this.deliveryFinalStats.total_net.value + item.item_net;
      this.deliveryFinalStats.discount_total.value =
        this.deliveryFinalStats.total_discount_amount.value +
        item.item_discount_amount;
      this.deliveryFinalStats.grand_total.value =
        this.deliveryFinalStats.grand_total.value + item.item_grand_total;

      return;
    }

    this.orderFinalStats.gross_total.value =
      this.orderFinalStats.gross_total.value + item.item_grand_total;
    this.orderFinalStats.vat_total.value =
      this.orderFinalStats.vat_total.value + item.item_vat;
    this.orderFinalStats.excise_total.value =
      this.orderFinalStats.excise_total.value + item.item_excise;
    this.orderFinalStats.net_total.value =
      this.orderFinalStats.net_total.value + item.item_net;
    this.orderFinalStats.discount_total.value =
      this.orderFinalStats.discount_total.value + item.item_discount_amount;
    this.orderFinalStats.grand_total.value =
      this.orderFinalStats.grand_total.value + item.item_grand_total;
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: ApiItemPriceStats
  ): OrderItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_qty: form.controls.item_qty.value,
      item_uom_id: form.controls.item_uom_id.value,
      discount_id: result && result.discount_id ? result.discount_id : null,
      promotion_id: result && result.promotion_id ? result.promotion_id : null,
      is_free: result && result.is_free ? result.is_free : false,
      is_item_poi: result && result.is_item_poi ? result.is_item_poi : false,
      item_price: result && result.item_price ? Number(result.item_price) : 0,
      item_discount_amount:
        result && result.discount ? Number(result.discount) : 0,
      item_vat: result && result.total_vat ? Number(result.total_vat) : 0,
      item_net: result && result.total_net ? Number(result.total_net) : 0,
      item_excise:
        result && result.total_excise ? Number(result.total_excise) : 0,
      item_grand_total: result && result.total ? Number(result.total) : 0,
      item_gross: result && result.item_gross ? Number(result.item_gross) : 0,
      //item_qty: form.controls.item_qty.value
    };
  }

  private makeOrderPostCall(target: string): void {
    var is_Check = [];
    is_Check = this.finalOrderPayload.items;
    var valueArr = is_Check.map(function (item) {
      return item.item_id;
    });
    var isDuplicate = valueArr.some(function (item, idx) {
      return valueArr.indexOf(item) != idx;
    });
    if (!isDuplicate) {
      if (target === 'delivery') {
        this.subscriptions.push(
          this.apiService
            .addNewDelivery(this.finalDeliveryPayload)
            .subscribe(() => {
              this.makeOrderPostCall('order');
            })
        );
        return;
      } else if (target === 'order') {
        if (this.isEditForm) {
          this.finalOrderPayload[
            'estimate_code'
          ] = this.poNumberFormControl.value;
          this.subscriptions.push(
            this.apiService
              .editEstimation(
                this.purchaseOrderData.uuid,
                this.finalOrderPayload
              )
              .subscribe(() => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Edited Successfully!Please check the table'
                );
                this.router.navigate(['/estimate']);
              })
          );
        } else {
          this.finalOrderPayload[
            'estimate_code'
          ] = this.poNumberFormControl.value;
          this.subscriptions.push(
            this.apiService
              .addEstimation(this.finalOrderPayload)
              .subscribe(() => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Added Successfully!Please check the table'
                );
                this.router.navigate(['/estimate']);
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
