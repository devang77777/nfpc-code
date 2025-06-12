import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  DeliveryPayload,
  OrderUpdateProcess,
  ConvertDeliveryType,
} from '../order-models';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { ITEM_ADD_FORM_TABLE_HEADS } from '../order-form/order-form.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { OrderService } from '../order.service';
import { MasterService } from '../../../master/master.service';
import * as moment from 'moment';

@Component({
  selector: 'app-convert-to-delivery',
  templateUrl: './convert-to-delivery.component.html',
  styleUrls: ['./convert-to-delivery.component.scss'],
})
export class ConvertToDeliveryComponent implements OnInit {
  public color: ThemePalette = 'primary';
  public mode: ProgressSpinnerMode = 'indeterminate';
  public showSpinner: boolean = false;
  public uuid: string;
  public isDepotOrder: boolean;
  public orderData: any;
  public itemcheckedArray = [];
  public pageTitle: string = '';
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  public orderStats: { [key: string]: { label: string; value: number } } = {
    gross_total: { label: 'Gross Total', value: 0 },
    total_discount_amount: { label: 'Discount', value: 0 },
    total_net: { label: 'Net Total', value: 0 },
    total_excise: { label: 'Excise', value: 0 },
    total_vat: { label: 'Vat', value: 0 },
    grand_total: { label: 'Total', value: 0 },
  };

  public deliveryFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      gross_total: { label: 'Gross Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };
  public deliveryFormGroup: FormGroup;
  public selectedSalesmanId: any;
  public salesmanFormControl: FormControl;
  public orderTypeTitle = '';
  public paymentTermTitle: string;
  public selectedPayloadItems: any[] = [];
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  public nextCommingDeliveryCode: string = '';
  public deliveryNumber: string = '';
  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  public salesmen: any;
  public objectValues = Object.values;
  public finalDeliveryPayload: DeliveryPayload;
  public payloadItems: OrderItemsPayload[] = [];
  private formBuilder: FormBuilder;
  public convertDeliveryItemData: any;
  public customerData: any[] = [];
  public currentCustomerData: any;
  private quantityChangeRecord: number[] = [];
  private qtyInvalidTrigger: boolean = false;
  deliveryNumberPrefix: any;
  routeItemQtyRecords: any[] = [];
  routeQtydepot_id: any;
  isStartDelivery: boolean = false;
  storageLocationList: any[] = [];
  warehouseFormControl: FormControl;
  deliveryTimeFormControl: FormControl;
  constructor(
    private commonToasterService: CommonToasterService,
    private orderService: OrderService,
    private masterService: MasterService,
    apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
    });
  }

  public ngOnInit(): void {
    this.showSpinner = true;
    this.convertDeliveryItemData = this.route.snapshot.data['itemsorder'];
    this.isStartDelivery = this.route.snapshot.routeConfig.path.indexOf('start-delivery') > -1;
    this.buildForm();
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;

    this.uuid = this.route.snapshot.params.uuid;
    this.pageTitle = 'Customize Delivery';
    this.orderData = this.route.snapshot.data['order'];


    this.hasApprovalPending = Boolean(this.orderData.approval_status);
    this.isDepotOrder = Boolean(this.orderData.depot);
    this.setTermsTitle();

    this.orderTypes = this.route.snapshot.data['convert'].types.data;
    this.orderTypeTitle = this.orderTypes.find(
      (type) => type.id === this.orderData.order_type_id
    )?.name;
    this.salesmen = this.route.snapshot.data['convert'].salesman;
    this.uoms = this.route.snapshot.data['convert'].uoms.data;
    this.customerData = this.route.snapshot.data['convert'].customers.data;

    this.getCustomerDetail();
    this.getOrderCode();
    this.setupEditFormControls(this.convertDeliveryItemData);
    this.generatedeliveryFinalStats(false, false);
    this.getStorageLocation(this.orderData.lob_id)
  }

  getStorageLocation(lobId) {
    if (!lobId) {
      return;
    }
    this.apiService.getWarehouse(lobId).subscribe(x => {
      this.storageLocationList = x.data;
      if (this.orderData?.storage_location_id) {
        var storageArray = this.storageLocationList.filter(sl => sl.id == this.orderData.storage_location_id);
        if (storageArray.length > 0)
          var obj = { id: storageArray[0].id, itemName: storageArray[0].code + ' - ' + storageArray[0].name }
        this.warehouseFormControl.setValue([obj])
      }
    });
  }

  getCustomerDetail() {
    this.masterService.customerDetailListTable({ name: this.orderData.customer.firstname.toLowerCase(), page: 1, page_size: 10 })
      .subscribe(res => {
        this.currentCustomerData = res.data.find(x => x.user_id == this.orderData.customer_id);
        if (this.currentCustomerData.is_lob == 1) {
          var lob = this.currentCustomerData.customerlob.find(x => this.orderData.lob_id == x.lob_id);
          this.routeQtydepot_id = lob.route.depot_id;
          // this.isDepotOrder = true;
        } else if (this.currentCustomerData.is_lob == 0) {
          // this.routeQtydepot_id = this.currentCustomerData.route.depot_id;
          // this.isDepotOrder = true;
        }

        this.onHandQtyCheck();

      })
  }

  buildForm() {
    this.salesmanFormControl = new FormControl('');
    this.warehouseFormControl = new FormControl('');
    var currentTime = moment(new Date())
      .format('hh:mm');
    this.deliveryTimeFormControl = new FormControl(currentTime);
    this.deliveryFormGroup = this.formBuilder.group({
      salesMan: this.salesmanFormControl,
      selectAll: [''],
      items: new FormArray([]),
    });
  }

  public addItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.deliveryFormGroup.controls['items'] as FormArray;
    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl({ id: item.item.id, name: item.item.name, item_code: item.item.item_code }, [
            Validators.required,
          ]),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          item_qty: new FormControl(
            item.order_status === OrderUpdateProcess.PartialDeliver
              ? +item.open_qty
              : +item.item_qty,
            [Validators.required]
          ),
          item_uom_list: new FormControl([item.uom_info]),
          item_check_box: new FormControl(""),
          item_onhand_qty: new FormControl(0),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          item_qty: new FormControl(1, [Validators.required]),
          item_uom_list: new FormControl([]),
          item_check_box: new FormControl(""),
          item_onhand_qty: new FormControl(0)
        })
      );
    }

    this.addItemFilterToControl(
      itemControls.controls.length == 0 ? 0 : itemControls.controls.length - 1
    );
  }

  public setupEditFormControls(editData: any): void {
    if (editData.salesman) {
      let selectedSalesman = [{ id: editData.salesman.salesman_id, itemName: editData.salesman.salesman_name }];
      setTimeout(() => {
        this.salesmanFormControl.setValue(selectedSalesman);
      }, 1000);
    }
    editData.items.forEach((item: OrderItemsPayload, index: number) => {
      this.itemcheckedArray.push(false);
      item.item_qty =
        item.order_status === 'Partial-Delivered'
          ? +item.open_qty
          : +item.item_qty;
      this.quantityChangeRecord.push(+item.item_qty);
      this.addItemForm(item);
      const itemStats = this.payloadItems[index];
      if (itemStats) {
        Object.keys(this.payloadItems[index]).forEach((key) => {
          itemStats[key] = item[key];
        });
      }
    });
    // this.onHandQtyCheck();
    Object.keys(this.deliveryFinalStats).forEach((key) => {
      this.deliveryFinalStats[key].value = editData[key];
    });
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.deliveryFormGroup.get('items') as FormArray;
    return itemControls.controls;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.deliveryFormGroup.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    this.payloadItems[index] = this.setupPayloadItemArray(
      newFormGroup,
      this.convertDeliveryItemData.items[index - 1]
    );

    newFormGroup.valueChanges
      .pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((result) => {
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        if (
          newFormGroup.controls['item'].value &&
          newFormGroup.controls['item_uom_id'].value
        ) {
          const customerId = this.currentCustomerData.id;
          const qtyGreater: boolean = this.checkQtyGreater(
            result.item_qty,
            groupIndex
          );
          if (qtyGreater == true) {
            const body: any = {
              item_id: +result.item.id,
              item_uom_id: +result.item_uom_id,
              item_qty: result.item_qty,
              customer_id: this.isDepotOrder ? '' : customerId,
              depot_id: this.isDepotOrder ? this.orderData.depot_id : '',
              lob_id: this.orderData?.lob_id
            };
            this.subscriptions.push(
              this.orderService.getOrderItemStats(body).subscribe(
                (stats) => {
                  stats.data['id'] = this.payloadItems[groupIndex].id;
                  this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                    newFormGroup,
                    stats.data,
                    true
                  );
                  const selectedIndex = this.selectedPayloadItems.findIndex(
                    (x) => x.id === this.payloadItems[groupIndex].id
                  );
                  if (selectedIndex > -1) {
                    this.selectedPayloadItems[
                      selectedIndex
                    ].item_qty = this.payloadItems[groupIndex].item_qty;
                  }
                  this.generatedeliveryFinalStats(true, false);
                },
                (error) => {
                  console.error(error);
                }
              )
            );
          } else {
            this.commonToasterService.showWarning(
              'Item QTY should atleast be 1 and less than order placed'
            );
            // this.payloadItems[groupIndex] = this.setupPayloadItemArray(newFormGroup, this.setupEmptyItemValue);
            this.generatedeliveryFinalStats(false, false);
          }
        } else {
          this.payloadItems[groupIndex] = this.setupPayloadItemArray(
            newFormGroup
          );
          this.generatedeliveryFinalStats(false, false);
        }
      });
  }

  checkQtyGreater(qty?: number, index?: number): boolean {
    const actualQty = this.quantityChangeRecord[index];
    if (qty > actualQty) {
      return false;
    } else if (qty <= actualQty && qty > 0) {
      return true;
    }
    return false;
  }

  getCustomerId(userId: number): number {
    const cust = this.customerData.find((cus) => +cus.user_id === +userId);
    return cust ? cust.id : 0;
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: any,
    reUpdate?: boolean
  ): OrderItemsPayload {
    if (reUpdate) {
      return {
        id: result ? result.id : 0,
        item: form.controls.item.value,
        item_id: form.controls.item.value.id,
        item_code: form.controls.item.value.item_code,
        item_qty: form.controls.item_qty.value,
        item_uom_id: form.controls.item_uom_id.value,
        discount_id: result && result.discount_id ? result.discount_id : null,
        promotion_id:
          result && result.promotion_id ? result.promotion_id : null,
        is_free: result ? result.is_free : false,
        is_item_poi: result ? result.is_item_poi : false,
        item_price: result && result.item_price ? Number(result.item_price) : 0,
        item_discount_amount:
          result && result.discount ? Number(result.discount) : 0,
        item_vat: result && result.total_vat ? Number(result.total_vat) : 0,
        item_net: result && result.total_net ? Number(result.total_net) : 0,
        total_net: result && result.net_gross ? Number(result.net_gross) - Number(result.discount) : 0,
        item_excise:
          result && result.total_excise ? Number(result.total_excise) : 0,
        total_excise:
          result && result.net_excise ? Number(result.net_excise) : 0,
        item_grand_total: result && result.total ? Number(result.total) : 0,
        item_gross: result && result.net_gross ? Number(result.net_gross) : 0,
      };
    } else {
      return {
        id: result ? result.id : 0,
        item: form.controls.item.value,
        item_id: form.controls.item.value.id,
        item_qty: form.controls.item_qty.value,
        item_uom_id: form.controls.item_uom_id.value,
        discount_id: result && result.discount_id ? result.discount_id : null,
        promotion_id:
          result && result.promotion_id ? result.promotion_id : null,
        is_free: result ? result.is_free : false,
        is_item_poi: result ? result.is_item_poi : false,
        item_price:
          result && result.item_price ? Number(+result.item_price) : 0,
        item_discount_amount: result ? Number(+result.item_discount_amount) : 0,
        item_vat: result ? Number(+result.item_vat) : 0,
        item_net: result && result.total_net ? Number(result.total_net) : 0,
        total_net: result && result.net_gross ? Number(result.net_gross) - Number(result.discount) : 0,
        item_excise: result ? Number(+result.total_excise) : 0,
        total_excise:
          result && result.net_excise ? Number(result.net_excise) : 0,
        item_grand_total: result ? Number(+result.item_grand_total) : 0,
        item_gross: result ? Number(+result.net_gross) : 0,
      };
    }
  }

  get setupEmptyItemValue() {
    return {
      discount: 0,
      discount_id: 0,
      discount_percentage: 0,
      is_free: false,
      is_item_poi: false,
      item_gross: 0,
      item_price: 0,
      item_qty: 0,
      promotion_id: null,
      total: 0,
      total_excise: 0,
      total_net: 0,
      total_vat: 0,
    };
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'delivery',
    };
    this.orderService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingDeliveryCode = res.data.number_is;
        this.deliveryNumberPrefix = res.data.prefix_is;
        if (this.nextCommingDeliveryCode) {
          this.deliveryNumber = this.nextCommingDeliveryCode;
        } else if (this.nextCommingDeliveryCode == null) {
          this.nextCommingDeliveryCode = '';
          this.deliveryNumber = '';
        }
      } else {
        this.nextCommingDeliveryCode = '';
        this.deliveryNumber = '';
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Delivery Code',
      functionFor: 'delivery',
      code: this.deliveryNumber,
      prefix: this.deliveryNumberPrefix,
      key: this.deliveryNumber.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.deliveryNumber = '';
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.deliveryNumber = res.data.next_coming_number_delivery;
          this.deliveryNumberPrefix = res.reqData.prefix_code;
        }
      });
  }

  goToOrders() {
    this.router.navigate(['transaction/order']);
  }

  public salesmanChanged(id: number): void {
    this.selectedSalesmanId = id;
    this.salesmanFormControl.setValue(id);
  }

  public selectAll(event) {
    const isChecked = event.target.checked;
    if (isChecked) {
      let i = 0;
      this.selectedPayloadItems = [];
      this.payloadItems.forEach(item => {
        this.selectedPayloadItems.push(item);
        this.itemcheckedArray[i] = isChecked;
        i++;
      });
    } else {
      this.selectedPayloadItems = [];
      let i = 0;
      this.itemFormControls.forEach(item => {
        this.itemcheckedArray[i] = isChecked;
        i++;
      });
    }
  }

  public itemDidSelected(event: any, item: OrderItemsPayload, i): void {
    this.itemcheckedArray[i] = event.target.checked;
    const isChecked = event.target.checked;
    const currentIndex = this.selectedPayloadItems.indexOf(item);

    if (isChecked) {
      this.selectedPayloadItems.push(item);
    } else {
      this.selectedPayloadItems.splice(currentIndex, 1);
    }
    if (this.payloadItems.length > this.selectedPayloadItems.length) {
      this.deliveryFormGroup.patchValue({
        selectAll: false
      })
    } else {
      this.deliveryFormGroup.patchValue({
        selectAll: true
      })
    }
    this.generatedeliveryFinalStats(false, true);
  }

  private generatedeliveryFinalStats(
    isUpdated?: boolean,
    isItemSelection?: boolean
  ): void {
    if (isItemSelection) {
      Object.values(this.orderStats).forEach((item) => {
        item.value = 0;
      });
      this.selectedPayloadItems.forEach((item: OrderItemsPayload) => {
        this.sumUpFinalStats(item, true);
      });
      if (!isUpdated) {
        return;
      }
    }
    Object.values(this.deliveryFinalStats).forEach((item) => {
      item.value = 0;
    });
    this.payloadItems.forEach((item: any) => {
      if (!item['total_excise']) {
        item['total_excise'] = Number(item.item_excise) * Number(item.item_qty)
      }

      if (!item['total_net']) {
        item['total_net'] = Number(item.item_gross) - Number(item.item_discount_amount)
      }
      this.sumUpFinalStats(item, false);
    });
  }

  public checkFormValidation(): boolean {
    // if (this.salesmanFormControl.invalid) {
    //   Utils.setFocusOn('typeFormField');
    //   return false;
    // }
    return true;
  }

  private sumUpFinalStats(item: any, isForDelivery?: boolean): void {
    if (isForDelivery) {
      this.orderStats.gross_total.value =
        this.orderStats.gross_total.value + +item.item_gross;
      this.orderStats.total_vat.value =
        this.orderStats.total_vat.value + +item.item_vat;
      this.orderStats.total_excise.value =
        this.orderStats.total_excise.value + item.total_excise;
      this.orderStats.total_net.value =
        this.orderStats.total_net.value + +item.total_net;
      this.orderStats.total_discount_amount.value =
        this.orderStats.total_discount_amount.value +
        +item.item_discount_amount;
      this.orderStats.grand_total.value =
        this.orderStats.grand_total.value + +item.item_grand_total;
      return;
    } else {
      this.deliveryFinalStats.gross_total.value =
        this.deliveryFinalStats.gross_total.value + item.item_gross;
      this.deliveryFinalStats.total_vat.value =
        this.deliveryFinalStats.total_vat.value + item.item_vat;
      this.deliveryFinalStats.total_excise.value =
        this.deliveryFinalStats.total_excise.value + item.total_excise;
      this.deliveryFinalStats.total_net.value =
        this.deliveryFinalStats.total_net.value + item.total_net;
      this.deliveryFinalStats.total_discount_amount.value =
        this.deliveryFinalStats.total_discount_amount.value +
        +item.item_discount_amount;
      this.deliveryFinalStats.grand_total.value =
        this.deliveryFinalStats.grand_total.value + item.item_grand_total;
      return;
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );
    return selectedUom ? selectedUom?.name : '';
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.orderService.getPaymentTerm().subscribe((result) => {
        this.terms = result.data;
        this.paymentTermTitle = this.terms.find(
          (item) => item.id === this.orderData.payment_term_id
        )?.name;
      })
    );
  }

  postFinalOrder() {
    // if (this.salesmanFormControl.invalid) {
    //   this.commonToasterService.showWarning('Please select salesman');
    //   return;
    // }

    if (!this.selectedPayloadItems.length) {
      this.commonToasterService.showWarning(
        'Please select item to be delivered'
      );
      return;
    }
    let status: boolean[] = [];
    this.itemFormControls.forEach((item: FormControl, i) => {
      status.push(this.checkQtyGreater(item.value.item_qty, i));
    });

    if (status.includes(false)) {
      this.commonToasterService.showWarning('Please Enter Proper QTY');
      return;
    }

    const totalStats = {};
    Object.keys(this.deliveryFinalStats).forEach((key: string) => {
      if (key == 'gross_total') {
        console.log('this.orderStats[key].value', this.deliveryFinalStats[key].value)
        totalStats['total_gross'] = this.deliveryFinalStats[key].value;
      } else {
        totalStats[key] = this.deliveryFinalStats[key].value;
      }
    });

    const finalPayload = {
      order_id: this.orderData.id,
      customer_id: this.orderData.customer_id,
      lob_id: this.orderData.lob_id,
      salesman_id: this.salesmanFormControl.value[0]?.id,
      storage_location_id: this.warehouseFormControl.value[0] && this.warehouseFormControl.value[0].id || "",
      delivery_number: this.deliveryNumber,
      delivery_date: this.orderData.delivery_date,
      delivery_time: this.deliveryTimeFormControl.value,
      delivery_due_date: this.orderData.due_date,
      delivery_type: this.orderData.order_type_id,
      delivery_type_source: ConvertDeliveryType.OrderToDelivery,
      delivery_weight: 0,
      payment_term_id: this.orderData.payment_term_id,
      current_stage_comment: 'pending',
      items: undefined,
      ...totalStats,
      source: 3,
      status: 1,
    };
    const itemPayload: any[] = [];
    this.selectedPayloadItems.forEach((item) => {
      const selecteditem = this.mapDeliveryItem(item);
      itemPayload.push(selecteditem);
    });

    finalPayload.items = itemPayload;
    finalPayload['total_qty'] = itemPayload.length;
    this.postDelivery(finalPayload);
  }

  mapDeliveryItem(item: any) {
    return {
      id: +item.id,
      item_id: item.item.id,
      item_uom_id: item.item_uom_id,
      discount_id: item.discount_id,
      is_free: item.is_free,
      is_item_poi: item.is_item_poi,
      promotion_id: item.promotion_id ? item.promotion_id : null,
      item_qty: item.item_qty,
      item_price: item.item_price,
      item_gross: item.item_gross,
      item_discount_amount: item.item_discount_amount,
      item_net: Number(item.item_net),
      item_vat: item.item_vat,
      item_excise: item.item_excise,
      item_grand_total: item.item_grand_total,
      batch_number: null,
    };
  }

  postDelivery(payload: any) {
    this.orderService.postDelivery(payload).subscribe(
      (res: any) => {
        if (res.status) {
          this.commonToasterService.showSuccess(
            'Delivery',
            'Order Sucessfully converted to Delivery'
          );
          this.router.navigate(['transaction/delivery']);
        }
      },
      (error) => {
        this.commonToasterService.showError(
          'Delivery',
          'Failed Converting Order to Delivery, Please try again!!!'
        );
      }
    );
  }

  getItemStatus(item) {
    let status: boolean = true;
    switch (item.order_status) {
      case OrderUpdateProcess.Pending:
        status = false;
        break;
      case OrderUpdateProcess.PartialDeliver:
        status = false;
        break;
      case OrderUpdateProcess.InProcess:
        status = false;
        break;
      case OrderUpdateProcess.Accept:
        status = false;
        break;
      case OrderUpdateProcess.Delivered:
        status = true;
        break;
      case OrderUpdateProcess.Completed:
        status = true;
        break;
    }
    return status;
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }

  onHandQtyCheck() {
    if (!this.routeQtydepot_id) {
      return;
    }
    let items = [];
    this.itemFormControls.forEach(element => {
      items.push(element.get('item').value.id);
    });
    const model = {
      depot_id: this.routeQtydepot_id || 0,
      item_id: items
    };
    this.apiService
      .onHandQtyCheck(model)
      .pipe()
      .subscribe((result) => {
        this.routeItemQtyRecords = result.data;
        this.filterQtyHand();
      }, error => {
        this.filterQtyHand();

      })
  }

  filterQtyHand() {
    this.itemFormControls.forEach(element1 => {
      var index = 0;
      element1.get('item_onhand_qty').setValue(0.00);

      this.routeItemQtyRecords?.forEach(element => {

        index++;
        if (element1.value.item.id == element.item_id) {
          element1.get('item_onhand_qty').setValue(element.qty);
          index--;
        }

        if (index == this.routeItemQtyRecords?.length) {
          element1.get('item_onhand_qty').setValue(0.00);
        }
      });
    });
  }
}
