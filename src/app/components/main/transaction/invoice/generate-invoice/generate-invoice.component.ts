import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import {
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
  ConvertInvoiceType,
} from '../../orders/order-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ITEM_ADD_FORM_TABLE_HEADS } from '../../orders/order-form/order-form.component';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { DeliveryModel } from '../../delivery/delivery-model';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { InvoiceServices } from '../invoice.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.scss'],
})
export class GenerateInvoiceComponent implements OnInit {
  public uuid: string;
  public isDepotOrder: boolean;
  public deliveryData: DeliveryModel;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  itemQtyAvlaible = [];
  public orderStats: { key: string; label: string }[] = [
    { key: 'total_gross', label: 'Gross Total' },
    { key: 'total_discount_amount', label: 'Discount' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'total_excise', label: 'Excise' },
    { key: 'total_vat', label: 'Vat' },
    { key: 'grand_total', label: 'Invoice Total' },
  ];
  public deliveryFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      grand_total: { label: 'Invoice Total', value: 0 },
    };
  public selectedPayloadItems: any[] = [];
  public dialogRef: MatDialog;
  public orderTypeTitle: string = '';
  public paymentTermTitle: string;
  public payloadItems: any[] = [];
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  public nextCommingInvoiceCode: string = '';
  public invoiceNumber: string = '';
  private router: Router;
  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private quantityChangeRecord: number[] = [];
  public invoiceFormGroup: FormGroup;
  public customerData: any[] = [];
  private formBuilder: FormBuilder;
  public convertDeliveryItemData: any;
  invoiceNumberPrefix: any;
  constructor(
    private invoiceServices: InvoiceServices,
    private commonToasterService: CommonToasterService,
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
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.uuid = this.route.snapshot.params.uuid;
    this.customerData = this.route.snapshot.data['resolved'].customers.data;
    this.deliveryData = this.route.snapshot.data['resolved'].delivery;
    this.buildForm();
    this.hasApprovalPending = Boolean(this.deliveryData.approval_status);
    this.isDepotOrder = Boolean(this.deliveryData.depot);
    this.setTermsTitle();

    this.subscriptions.push(
      this.apiService.getOrderTypes().subscribe((result) => {
        this.orderTypes = result.data;
        this.orderTypeTitle = this.orderTypes.find(
          (type) => type.id === this.deliveryData.delivery_type
        ).name;
      })
    );

    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );
    this.getInvoiceCode();

    this.deliveryData.delivery_details = this.deliveryData.delivery_details.map(
      (item) => {
        return {
          ...item,
          item_qty:
            item['delivery_status'] === OrderUpdateProcess.PartialInvoice
              ? +item['open_qty']
              : +item.item_qty,
        };
      }
    );
    this.payloadItems = JSON.parse(
      JSON.stringify(this.deliveryData.delivery_details)
    );
    //console.log(this.payloadItems);
    this.setupForm(this.deliveryData);
  }
  public setupForm(editData: any): void {
    editData.delivery_details.forEach(
      (item: OrderItemsPayload, index: number) => {
        this.quantityChangeRecord.push(+item.item_qty);
        this.addItemForm(item);
      }
    );

    Object.keys(this.deliveryFinalStats).forEach((key) => {
      this.deliveryFinalStats[key].value = editData[key];
    });
  }
  public addItemForm(item?: any): void {
    const itemControls = this.invoiceFormGroup.controls['items'] as FormArray;

    itemControls.push(
      new FormGroup({
        checked: new FormControl({
          value: false,
          disabled: this.getItemStatus(item),
        }),
        id: new FormControl(item.id),
        uuid: new FormControl(item.uuid),
        item_uom_id: new FormControl(item.item_uom_id),
        item_qty: new FormControl(
          {
            value: item.item_qty,
            disabled: this.getItemStatus(item),
          },
          [Validators.required]
        ),
      })
    );

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }
  updateForm(formArrayIndexItem: FormGroup, data) {
    formArrayIndexItem.patchValue({
      item_qty: data.item_qty,
    });
  }
  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.invoiceFormGroup.get('items') as FormArray;
    return itemControls.controls;
  }
  getCustomerId(userId: number): number {
    const cust = this.customerData.find((cus) => +cus.user_id === +userId);
    return cust ? cust.id : 0;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.invoiceFormGroup.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    newFormGroup
      .get('item_qty')
      .valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((result) => {
        this.isStockCheck(newFormGroup.value);
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        const customerId = this.getCustomerId(this.deliveryData.customer_id);
        const qtyGreater: boolean = this.checkQtyGreater(result, groupIndex);
        if (qtyGreater == true) {
          const body: any = {
            item_id: +this.payloadItems[groupIndex].item_id,
            item_uom_id: +this.payloadItems[groupIndex].item_uom_id,
            item_qty: result,
            customer_id: customerId,
          };
          this.subscriptions.push(
            this.apiService.getOrderItemStats(body).subscribe(
              (stats) => {
                const mapped = this.mapDeliveryItem(
                  this.payloadItems[groupIndex],
                  stats.data
                );
                this.payloadItems[groupIndex] = mapped;
                this.generatedeliveryFinalStats();
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
  private generatedeliveryFinalStats(): void {
    Object.values(this.deliveryFinalStats).forEach((item) => {
      item.value = 0;
    });
    this.payloadItems.forEach((item: any) => {
      this.sumUpFinalStats(item, false);
    });
  }
  buildForm() {
    this.invoiceFormGroup = this.formBuilder.group({
      selectAll: [''],
      items: new FormArray([]),
    });
  }

  public isStockCheck(data) {
    console.log(data);
    let customer = this.customerData.find((cus) => +cus.user_id === +this.deliveryData.customer_id);
    const model = {
      item_id: data.id,
      item_uom_id: data.item_uom_id,
      item_qty: data.item_qty,
      route_id: customer.is_lob == 1 ? customer?.customerlob[0]?.route_id : customer?.route_id,
    };
    this.apiService
      .isStockCheck(model)
      .pipe()
      .subscribe((result) => {
        this.itemQtyAvlaible[data.item.id] = result.data;
        console.log(result, this.itemQtyAvlaible);
      })
  }

  public selectAll(event) {
    const isChecked = event.target.checked;

    if (isChecked) {
      let i = 0;
      this.payloadItems.forEach(item => {
        this.selectedPayloadItems.push(item);
        this.itemFormControls[i].get("checked").setValue(true);
        i++;
      });
    } else {
      this.selectedPayloadItems = [];
      let i = 0;
      this.itemFormControls.forEach(item => {
        item.get("checked").setValue(false);
        i++;
      })
    }
  }

  getInvoiceCode() {
    let nextNumber = {
      function_for: 'invoice',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingInvoiceCode = res.data.number_is;
        this.invoiceNumberPrefix = res.data.prefix_is;
        if (this.nextCommingInvoiceCode) {
          this.invoiceNumber = this.nextCommingInvoiceCode;
        } else if (this.nextCommingInvoiceCode == null) {
          this.nextCommingInvoiceCode = '';
          this.invoiceNumber = '';
        }
      } else {
        this.nextCommingInvoiceCode = '';
        this.invoiceNumber = '';
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Invoice Code',
      functionFor: 'invoice',
      code: this.invoiceNumber,
      prefix: this.invoiceNumberPrefix,
      key: this.invoiceNumber.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.invoiceNumber = '';
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.invoiceNumber = res.data.next_coming_number_invoice;
          this.invoiceNumberPrefix = res.reqData.prefix_code;
        }
      });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find((uom) => uom.id === item.item_uom_id);
    return selectedUom ? selectedUom.name : '';
  }

  public goToDeliveries(): void {
    this.router.navigate(['transaction/delivery/detail', this.uuid]);
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.apiService.getPaymenterms().subscribe((result) => {
        this.terms = result.data;
        this.paymentTermTitle = this.terms.find(
          (item) => item.id === this.deliveryData.payment_term_id
        ).name;
      })
    );
  }

  private sumUpFinalStats(item: any, isForDelivery?: boolean): void {
    this.deliveryFinalStats.total_gross.value =
      this.deliveryFinalStats.total_gross.value + +item.item_gross;
    this.deliveryFinalStats.total_vat.value =
      this.deliveryFinalStats.total_vat.value + +item.item_vat;
    this.deliveryFinalStats.total_excise.value =
      this.deliveryFinalStats.total_excise.value + +item.item_excise;
    this.deliveryFinalStats.total_net.value =
      this.deliveryFinalStats.total_net.value + +item.item_net;
    this.deliveryFinalStats.total_discount_amount.value =
      this.deliveryFinalStats.total_discount_amount.value +
      +item.item_discount_amount;
    this.deliveryFinalStats.grand_total.value =
      this.deliveryFinalStats.grand_total.value + +item.item_grand_total;
    return;
  }

  public itemDidSelected(event: any, item: OrderItemsPayload): void {
    console.log(item);
    const isChecked = event.target.checked;
    const currentIndex = this.selectedPayloadItems.indexOf(item);

    if (isChecked) {
      this.selectedPayloadItems.push(item);
    } else {
      this.selectedPayloadItems.splice(currentIndex, 1);
    }
    if (this.payloadItems.length > this.selectedPayloadItems.length) {
      this.invoiceFormGroup.patchValue({
        selectAll: false
      })
    } else {
      this.invoiceFormGroup.patchValue({
        selectAll: true
      })
    }
  }

  postFinalOrder() {
    const totalStats = {};
    Object.keys(this.deliveryFinalStats).forEach((key: string) => {
      totalStats[key] = this.deliveryFinalStats[key].value;
    });

    let invoiceType: number = this.deliveryData.order_id
      ? ConvertInvoiceType.OrderToDeliveryToInvoice
      : ConvertInvoiceType.DeliveryDirectToInvoice;

    const finalPayload = {
      customer_id: +this.deliveryData.customer_id,
      lob_id: this.deliveryData.lob_id,
      salesman_id: this.deliveryData.salesman_id,
      order_id: this.deliveryData.order_id ? +this.deliveryData.order_id : null,
      order_type_id: this.deliveryData.delivery_type,
      delivery_id: +this.deliveryData.id,
      invoice_type: invoiceType,
      invoice_number: this.invoiceNumber ? this.invoiceNumber : '',
      invoice_date: this.deliveryData.delivery_date
        ? this.deliveryData.delivery_date
        : null,
      payment_term_id: +this.deliveryData.payment_term_id,
      invoice_due_date: this.deliveryData.delivery_due_date
        ? this.deliveryData.delivery_due_date
        : null,
      current_stage_comment: this.deliveryData.current_stage_comment,
      items: undefined,
      ...totalStats,
      source: 3,
      status: 1,
    };




    const itemControls = this.invoiceFormGroup.controls['items'] as FormArray;
    const selectedItem = itemControls.value.filter((item) => item.checked);
    console.log('selectedItem', selectedItem)
    const itemPayload: any[] = [];
    selectedItem.forEach((item) => {
      const data = this.payloadItems.find((x) => x.id == item.id);
      if (!data) return;
      itemPayload.push(data);
    });
    // if (this.payloadItems.length > this.selectedPayloadItems.length) {
    //   this.invoiceFormGroup.patchValue({
    //     selectAll: false
    //   })
    // } else {
    //   this.invoiceFormGroup.patchValue({
    //     selectAll: true
    //   })
    // }
    finalPayload.items = itemPayload;
    finalPayload['total_qty'] = itemPayload.length;

    this.generateInvoice(finalPayload);
  }

  mapDeliveryItem(original, item: any) {
    return {
      ...original,
      item_vat: item.total_vat,
      item_net: item.total_net,
      item_excise: item.net_excise,
      item_grand_total: item.total,
      item_discount_amount: item.discount,
      item_gross: item.item_gross,
      item_qty: item.item_qty,
    };
  }

  generateInvoice(finalPayload) {
    if (!finalPayload.items.length) {
      this.commonToasterService.showWarning(
        'Please select atleast one items to generate invoice'
      );
      return;
    }

    this.invoiceServices.saveInvoice(finalPayload).subscribe(
      (res: any) => {
        if (res.status) {
          this.commonToasterService.showSuccess(
            '',
            'Successfully Generated Invoice for items'
          );
          this.router.navigate(['transaction/invoice']);
        }
      },
      (error) => {
        this.commonToasterService.showError(
          'Error generating invoice',
          'Please try again'
        );
      }
    );
  }

  getItemStatus(item) {
    let status: boolean = true;
    switch (item.delivery_status) {
      case OrderUpdateProcess.Pending:
        status = false;
        break;
      case OrderUpdateProcess.PartialDeliver:
        status = false;
        break;
      case OrderUpdateProcess.PartialInvoice:
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
      case OrderUpdateProcess.Invoiced:
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
}
