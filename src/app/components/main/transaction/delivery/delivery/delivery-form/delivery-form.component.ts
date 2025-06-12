import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { formatDate, DatePipe } from '@angular/common';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { BranchDepotMaster } from 'src/app/components/main/settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
  ConvertDeliveryType,
} from 'src/app/components/main/transaction/orders/order-models';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import { OrderTypeFormComponent } from 'src/app/components/main/transaction/orders/order-type/order-type-form/order-type-form.component';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { OrderService } from '../../orders/order.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeliveryService } from '../delivery.service';
import { InvoiceServices } from '../../invoice/invoice.service';
import * as moment from 'moment';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { MasterService } from '../../../master/master.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { BulkItemModalComponent } from '../../bulk-item-modal/bulk-item-modal.component';
import { ITEM_DELIVERY_FORM_TABLE_HEADS } from '../delivery-detail/delivery-detail.component';
@Component({
  selector: 'app-delivery-form',
  templateUrl: './delivery-form.component.html',
  styleUrls: ['./delivery-form.component.scss'],
})
export class DeliveryFormComponent implements OnInit, OnDestroy {
  reason_index: any;
  isQtyChange = false;
  reasonsList: any = [];
  filterReason: any = [];
  public todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  public dueDateSet: any;
  public currentDate: any;
  public pageTitle: string;
  public isEditForm: boolean;
  public isDeliveryForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public deliveryNumber: string = '';
  public invoiceNumber: string = '';
  public deliveryData: OrderModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };
  public deliveryFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      grand_total: { label: 'Invoice Total', value: 0 },
    };
  customerLobList = [];
  public orderFormGroup: FormGroup;
  public orderTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public noteFormControl: FormControl;
  public paymentTermFormControl: FormControl;
  public deliveryDateFormControl: FormControl;
  public deliveryTimeFormControl: FormControl;
  public dueDateFormControl: FormControl;
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public salesmen: SalesMan[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public showGenerateInvoice: boolean = true;
  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedSalesmanId: number;
  public selectedPaymentTermId: number;
  public nextCommingDeliveryCode: string = '';
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
  deliveryNumberPrefix: any;
  nextCommingDeliveryCodePrefix: any;
  creditLimit;
  public filterCustomer: any[] = [];
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  isLoading: boolean;
  filterValue = '';
  public page = 0;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  itemfilterValue = '';
  public is_lob: boolean = false;
  keyUp = new Subject<string>();
  keyUpItem = new Subject<string>();
  warehouseFormControl: FormControl;
  isCustomerlobShow: boolean = false;
  storageLocationList: any[] = []; isEnterMannual: boolean;
  ;
  showLob = false;
  showWareHs = false;
  private noFirstReqInEdit = false;
  isPickingFilter: any;
  constructor(
    private datePipe: DatePipe,
    private orderService: OrderService,
    apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    private deliveryService: DeliveryService,
    private invoiceServices: InvoiceServices,
    private commonToasterService: CommonToasterService,
    private masterService: MasterService,
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
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate() + 1) < 10) {
      date = '0' + (today.getDate());
    }

    this.currentDate = moment(new Date()).format('YYYY-MM-DD');
    this.subscriptions.push(
      this.masterService.itemDetailDDllistTable({}).subscribe((result) => {
        this.itempage++;
        this.items = result.data;
        this.filteredItems = result.data;
        this.item_total_pages = result.pagination?.total_pages
      })
    );
    this.isEditForm = this.router.url.includes('transaction/delivery/edit/');
    this.isDeliveryForm = this.router.url.includes(
      'transaction/delivery/start-delivery/'
    );
    this.itemTableHeaders = ITEM_DELIVERY_FORM_TABLE_HEADS;

    this.orderTypeFormControl = new FormControl(this.selectedOrderTypeId, [
      Validators.required,
    ]);
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
    this.salesmanFormControl = new FormControl(this.selectedSalesmanId);
    this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId);
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl([], [Validators.required]);
    this.noteFormControl = new FormControl('', [Validators.required]);
    this.dueDateFormControl = new FormControl('', [Validators.required]);
    this.deliveryDateFormControl = new FormControl(this.currentDate, [Validators.required]);
    var currentTime = moment(new Date())
      .format('hh:mm');
    this.deliveryTimeFormControl = new FormControl(currentTime);
    this.warehouseFormControl = new FormControl('');

    this.orderFormGroup = this.formBuilder.group({
      delivery_type: this.orderTypeFormControl,
      payment_term_id: this.paymentTermFormControl,
      depot_id: this.depotFormControl,
      salesman_id: this.salesmanFormControl,
      any_comment: this.noteFormControl,
      delivery_due_date: this.dueDateFormControl,
      delivery_date: this.deliveryDateFormControl,
      delivery_Time: this.deliveryTimeFormControl,
      items: this.initItemFormArray(),
    });
    // this.customerFormControl.disable();
    //this.items = this.route.snapshot.data['resolved'].items.data;

    this.isLoading = true;
    this.subscriptions.push(
      this.masterService.customerDetailDDlListTable({}).subscribe((result) => {
        this.isLoading = false;
        this.page++;
        this.customers = result.data;
        this.filterCustomer = result.data.slice(0, 30);
        this.total_pages = result.pagination?.total_pages
      })
    );
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    //this.customers = this.route.snapshot.data['resolved'].customers.data;
    this.orderTypes = this.route.snapshot.data['resolved'].types.data;
    this.deliveryDateFormControl.valueChanges.subscribe(() => {
      this.setupDueDate();
    });

    if (this.isEditForm || this.isDeliveryForm) {
      this.noFirstReqInEdit = true;
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = this.isEditForm ? 'Edit Delivery' : 'Customize Delivery';
      this.deliveryData = this.route.snapshot.data['delivery'];
      this.deliveryNumber = this.deliveryData?.delivery_number;
      this.setupEditFormControls(this.deliveryData);
    } else {
      this.pageTitle = 'Add Delivery';
      this.addItemFilterToControl(0);
    }

    if (this.isDeliveryForm) {
      this.deliveryDateFormControl.disable();
      this.dueDateFormControl.disable();
    }
    this.subscriptions.push(
      this.customerFormControl.valueChanges.subscribe((value) => {
        this.selectedPaymentTermId = value.payment_term_id;
        this.paymentTermFormControl.patchValue(value.payment_term_id);
      })
    );
    this.subscriptions.push(
      this.customerFormControl.valueChanges
        .pipe(
          debounceTime(500),
          startWith<string | Customer>(''),
          map((value) => (typeof value === 'string' ? value : value?.user?.firstname)),
          map((value: string) => {
            return value;
          })
        ).subscribe((res) => {

        })
    );

    this.subscriptions.push(
      this.apiService.getAllDepots().subscribe((result) => {
        this.depots = result.data;
      })
    );

    this.subscriptions.push(
      this.apiService.getCreditLimits().subscribe((result) => {
        this.creditLimit = result.data;
      })
    );

    this.subscriptions.push(
      this.apiService.getSalesMan().subscribe((result) => {
        this.salesmen = result.data;
      })
    );

    this.apiService.getReturnAllReasonsType().subscribe(res => {
      this.reasonsList = res.data;
      this.filterReason = [...this.reasonsList];
    });
    this.subscriptions.push(
      this.deliveryService.getPaymentTerm().subscribe((result) => {
        this.terms = result.data;
      })
    );
    this.getDeliveryCode();
    this.getOrderStatus();

    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailDDlListTable({ search: this.filterValue.toLowerCase() })
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.customers = res.data;
        this.filterCustomer = res.data.splice(0, 30);
        // if (this.filterValue == "") {
        //   if (this.page > 1) {
        //     this.customers = [...this.customers, ...res.data];
        //     this.filterCustomer = [...this.filterCustomer, ...res.data];
        //   } else {
        //     this.customers = res.data;
        //     this.filterCustomer = res.data;
        //   }
        //   this.page++;
        //   this.total_pages = res?.pagination?.total_pages;
        // } else {
        //   this.customers = [...this.customers, ...res.data];
        //   this.filterCustomer = [...this.filterCustomer, ...res.data];
        // }
      })

    this.itemlookup$
      .pipe(exhaustMap(() => {
        return this.masterService.itemDetailDDllistTable({ search: this.itemfilterValue.toLowerCase() })
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.items = res.data;
        this.filteredItems = res.data;
        //   if (this.itemfilterValue == "") {
        //   if (this.itempage > 1) {
        //     this.items = [...this.items, ...res.data];

        //     this.filteredItems = [...this.filteredItems, ...res.data];
        //   } else {
        //     this.items = res.data;
        //     this.filteredItems = res.data;
        //   }
        //   this.itempage++;
        //   this.item_total_pages = res?.pagination?.total_pages;
        // } else {
        //   this.itempage = 1;
        //   this.items = res.data;
        //   this.filteredItems = res.data;
        // }
      });

    this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(100),
      )),
    ).subscribe(res => {
      if (!res) {
        res = '';
      }
      this.filterCustomers(res);
    });


    this.keyUpItem.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(100),
      )),
    ).subscribe(res => {
      if (!res) {
        res = '';
      }
      this.fiterItems(res);
    });

    this.customerLobFormControl.valueChanges.subscribe(res => {
      if (res.length > 0) {
        if (this.deliveryData) {
          this.deliveryData.lob_id = res[0].id;
        }
        this.isCustomerlobShow = true;
        if (this.customerLobList.length > 0) {
          var paymentTermId = this.customerLobList.find(x => x.lob_id == res[0].id)?.payment_term_id;
          this.paymentTermFormControl.patchValue(paymentTermId);
          this.selectedPaymentTermId = paymentTermId;
          this.apiService.getWarehouse(res[0].id).subscribe(x => {
            this.storageLocationList = x.data;
            if (this.deliveryData?.storage_location_id) {
              var storageArray = this.storageLocationList.filter(sl => sl.id == this.deliveryData?.storage_location_id);
              if (storageArray.length > 0)
                var obj = { id: storageArray[0].id, itemName: storageArray[0].code + ' - ' + storageArray[0].name }
              this.warehouseFormControl.setValue([obj])
            }
          });
          this.payTermChanged(paymentTermId);
        } else {
          this.warehouseFormControl.setValue([]);
        }
      }
      // this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);

    });
  }

  openLOB() {
    this.showLob = true;
  }
  openWarehouse() {
    this.showWareHs = true;
  }
  getCustomerLobList(customer, editData?) {
    if (this.customerFormControl.value.is_lob == 1 || editData.lob_id) {
      this.is_lob = true;
      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          this.customerLobFormControl.setValidators([Validators.required]);
          this.customerLobFormControl.updateValueAndValidity();

          let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
          this.customerLobFormControl.setValue(customerLob);
        }
        else {
          this.customerLobFormControl.setValidators([Validators.required]);
          this.customerLobFormControl.updateValueAndValidity();
        }
      })
    } else {
      this.is_lob = false;
      this.customerLobFormControl.clearValidators();
      this.customerLobFormControl.updateValueAndValidity();
    }
  }
  getWarehouseList(warehouse, editData?) {
    if (editData.warehouse_id) {
      this.apiService.getWarehouse(editData?.lob?.id).subscribe((result) => {
        this.storageLocationList = result.data || [];
        if (editData) {
          this.warehouseFormControl.setValidators([Validators.required]);
          this.warehouseFormControl.updateValueAndValidity();

          let warehouse = [{ id: editData?.warehouse_id, name: editData?.warehouse?.name }];
          this.warehouseFormControl.setValue(warehouse);

        }
        else {
          this.warehouseFormControl.setValidators([Validators.required]);
          this.warehouseFormControl.updateValueAndValidity();
        }
      })
    } else {
      // this.is_lob = false;
      this.warehouseFormControl.clearValidators();
      this.warehouseFormControl.updateValueAndValidity();
    }
  }
  getOrderStatus() {
    if (this.isEditForm) {
      let orderStatus = this.getStatus(this.deliveryData.current_stage);
      orderStatus
        ? (this.showGenerateInvoice = false)
        : (this.showGenerateInvoice = true);
    } else {
      this.showGenerateInvoice = true;
    }
  }

  getDeliveryCode() {
    let nextNumber = {
      function_for: 'delivery',
    };
    this.orderService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingDeliveryCode = res.data.number_is;
        this.nextCommingDeliveryCodePrefix = res.data.prefix_is;
        if (this.nextCommingDeliveryCode) {
          // this.deliveryNumber = this.nextCommingDeliveryCode;
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

  onScroll() {

    if (this.filterCustomer.length == this.customers.length) return;
    this.page = this.page + 30;
    var pageEndNumber = 30 + this.page;
    this.filterCustomer = [...this.filterCustomer, ...this.customers.slice(this.page, pageEndNumber)]

  }

  onScrollItem() {
    if (this.item_total_pages < this.itempage) return;
    this.isLoading = true;
    this.itemlookup$.next(this.itempage);
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Delivery Code',
      functionFor: 'delivery',
      code: this.deliveryNumber,
      prefix: this.nextCommingDeliveryCodePrefix,
      key: this.deliveryNumber.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        this.isEnterMannual = false;
        if (res.type == 'manual' && res.enableButton) {
          this.deliveryNumber = '';
          this.nextCommingDeliveryCode = '';
          this.isEnterMannual = true;
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.deliveryNumber = res.data.next_coming_number_delivery;
          this.nextCommingDeliveryCode = res.data.next_coming_number_delivery;
          this.nextCommingDeliveryCodePrefix = res.reqData.prefix_code;
        }
      });
  }

  public get filteredTableHeaders(): ItemAddTableHeader[] {
    this.itemTableHeaders.forEach(element => {
      if (element.key === 'driverName' || element.key === 'vehicleNo') {
        element.show = false;
      }
    });
    return [...this.itemTableHeaders].filter((item) => item.show);
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  public setupEditFormControls(editData: any): void {
    this.orderTypeChanged(editData['delivery_type']);
    editData.salesman = editData.salesman
      ? {
        salesman_id: editData.salesman.id,
        salesman_name: editData.salesman ? editData.salesman.firstname + " " + editData.salesman.lastname : '',
      }
      : null;
    if (editData.salesman) {
      let selectedSalesman = [{ id: editData.salesman.salesman_id, itemName: editData.salesman.salesman_name }];
      setTimeout(() => {
        this.salesmanFormControl.setValue(selectedSalesman);
      }, 1000);

    }
    // this.salesmanFormControl.setValue(
    //   editData.salesman ? editData.salesman['id'] : ''
    // );
    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find((cust) => cust.user_id === editData.customer.id);
    this.filteredCustomers.push(customer);
    this.selectedOrderTypeId = editData['delivery_type']?.id;
    this.selectedDepotId = editData['depot_id'];
    this.selectedPaymentTermId = editData.payment_term_id;
    this.paymentTermFormControl.setValue(editData.payment_term_id);
    editData.customerObj = { customer_infos_id: editData.customer?.customer_info?.id, id: editData.customer?.customer_info?.id, user: editData.customer, user_id: editData.customer?.customer_info?.user_id };
    editData.customer = editData.customer_id
      ? {
        customer_id: editData.customer_id,
        user_id: editData.customer?.customer_info?.user_id,
        customer_name: editData.customer
          ? editData.customer.firstname + ' ' + editData.customer.lastname
          : 'Unknown',
      }
      : undefined;
    this.customerFormControl.setValue(editData.customerObj);
    this.getCustomerLobList(editData.customer, editData);
    this.getWarehouseList(editData.warehouse, editData);
    // this.warehouseFormControl.setValue(editData.warehouse);
    this.noteFormControl.setValue(editData.customer_note);
    this.deliveryDateFormControl.setValue(editData.delivery_date);
    this.deliveryTimeFormControl = new FormControl(editData.delivery_time);

    this.dueDateFormControl.setValue(editData['delivery_due_date']);
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    if (editData.lob) {
      this.isCustomerlobShow = true;
    }
    itemControls.controls.length = 0;

    this.isPickingFilter = editData?.delivery_details.filter(i => i.is_picking === 1);

    editData?.delivery_details.forEach(
      (item: any, index: number) => {
        let newItem = this.mapItem(item);
        this.addItemForm(newItem);
        this.itemDidSearched(newItem, index, true);
        const itemStats = this.payloadItems[index];
        Object.keys(this.payloadItems[index]).forEach((key) => {
          itemStats[key] = newItem[key];
        });
      }
    );
    Object.keys(this.orderFinalStats).forEach((key) => {
      this.orderFinalStats[key].value = editData[key];
    });

    this.deliveryData = editData;

  }

  mapItem(apiItem) {
    const newItem: OrderItemsPayload = {
      item: {
        id: apiItem.item?.id,
        name: apiItem.item?.item_name,
        item_code: apiItem.item?.item_code,
        item_main_price: apiItem.item.item_main_price,
        item_uom_lower_unit: apiItem.item.item_uom_lower_unit
      },
      item_id: apiItem.item?.id,
      item_qty: apiItem?.item_qty,
      item_expiry_date: apiItem?.item_expiry_date,
      open_qty: apiItem?.open_qty,
      item_uom_id: apiItem.item_uom?.id.toString(),
      uom_info: apiItem?.item_uom,
      item_price: Number(apiItem?.item_price),
      item_discount_amount: Number(apiItem?.item_discount_amount),
      item_vat: Number(apiItem?.item_vat),
      item_excise: Number(apiItem?.item_excise),
      total_excise: Number(apiItem?.total_excise),
      item_grand_total: Number(apiItem?.item_grand_total),
      item_net: Number(apiItem?.item_net),
      discount_id: apiItem?.discount_id,
      is_free: Boolean(apiItem?.is_free),
      is_item_poi: Boolean(apiItem?.is_item_poi),
      item_gross:
        apiItem && apiItem.item_gross ? Number(apiItem?.item_gross) : 0,
      order_status: apiItem && apiItem.order_status ? apiItem.order_status : '',
      id: apiItem ? apiItem.id : 0,
      original_item_qty: apiItem && apiItem.original_item_qty ? Number(apiItem.original_item_qty) : 0,
      is_picking: apiItem && apiItem.is_picking ? apiItem.is_picking : 0,
      reason_id: apiItem && apiItem.reason_id ? apiItem.reason_id : null,
      reason: apiItem && apiItem.reason ? apiItem.reason : null
    };
    return newItem;
  }

  public addItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(
            { id: item?.item.id, code: item?.item.item_code, name: item?.item.name },
            [Validators.required]
          ),
          item_name: new FormControl(item?.item.name,
            [Validators.required]
          ),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          item_qty: new FormControl(item.item_qty, [Validators.required]),
          item_uom_list: new FormControl([item.uom_info]),
          reason_id: new FormControl({ value: item.reason ? { id: item.reason.id, name: item.reason.name, type: item.reason.type } : null, disabled: true }, [Validators.required]),
          original_item_qty: new FormControl(+item.original_item_qty, [Validators.required]),
          is_picking: new FormControl(item.is_picking == 1 ? true : false, [Validators.required]),

        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_name: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          item_qty: new FormControl(1, [Validators.required]),
          item_uom_list: new FormControl([]),
          reason_id: new FormControl(null, [Validators.required]),
          original_item_qty: new FormControl(item.original_item_qty, [Validators.required]),
          is_picking: new FormControl(item.is_picking == 1 ? true : false, [Validators.required]),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }



  public orderTypeChanged(id: number): void {
    if (id) {
      this.orderTypeFormControl.setValue(id);
      this.selectedOrderType = this.orderTypes.find((type) => type.id === id);
      if (this.selectedOrderType)
        this.isDepotOrder =
          this.selectedOrderType.use_for.toLowerCase() !== 'customer';
    }
  }

  public depotChanged(id: number): void {
    this.selectedDepotId = id;
    this.depotFormControl.setValue(id);
  }

  public salesmanChanged(id: number): void {
    this.selectedSalesmanId = id;
    this.salesmanFormControl.setValue(id);
  }

  public payTermChanged(id: number): void {
    this.selectedPaymentTermId = id;
    this.paymentTermFormControl.setValue(id);
    this.setupDueDate();
  }

  public addCustomer(): void {
    this.router.navigate(['masters/customer'], {
      queryParams: { create: true },
    });
  }
  public redirectToItem(): void {
    this.router.navigate(['masters/item'], {
      queryParams: { create: true },
    });
  }
  public goToOrder(): void {
    this.router.navigate(['transaction/delivery']);
  }

  public addOrderType(): void {
    this.dialogRef
      .open(OrderTypeFormComponent, {
        width: '500px',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.orderTypes = data;
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

  public itemControlValue(item: Item): { id: string; name: string, item_code: string } {
    return { id: item.id, name: item.item_name, item_code: item.item_code };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
    item_code: string
  }): string | undefined {
    return item ? item.item_code ? item.item_code : '' + " " + item.name : undefined;
  }
  public reasonValue(reason) {
    return { id: reason.id, name: reason.name, type: reason.type };
  }
  public reasonControlDisplayValue(reason?: {
    id: string;
    name: string;
  }): string | undefined {
    return reason ? reason.name ? reason.name : '' : undefined;
  }
  public customerControlDisplayValue(customer: any): string {
    if (customer?.user) {
      return `${customer?.user.customer_info?.customer_code ? customer?.user.customer_info?.customer_code : ''} ${customer?.user.firstname ? customer?.user.firstname + ' ' + customer?.user.lastname : ''} `

    } else
      return `${customer?.customer_code ? customer?.customer_code : ''} ${customer?.name ? customer?.name : ''} `
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

  public itemDidSearched(data: any, index: number, isFromEdit?: boolean): void {
    if (isFromEdit) {
      let selectedItem = data;
      selectedItem['lower_unit_uom_id'] = data?.item?.item_uom_lower_unit?.id || 0;
      selectedItem['item_main_price'] = data?.item?.item_main_price || [];
      setTimeout(() => {
        this.setUpRelatedUom(selectedItem, itemFormGroup, true);
      }, 1000);
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    } else if (!isFromEdit) {
      this.getItemDetailByName(data.name).subscribe(res => {
        var items = res.data || [];
        const selectedItem = items.find((item: Item) => item.id === data.id);
        const itemFormGroup = this.itemFormControls[index] as FormGroup;
        const itemnameControl = itemFormGroup.controls.item_name;
        itemnameControl.setValue(data.name);
        this.setUpRelatedUom(selectedItem, itemFormGroup);
      });
    }
  }
  getItemDetailByName(name) {
    return this.masterService
      .itemDetailListTable({ item_name: name.toLowerCase(), })

  }
  setUpRelatedUom(selectedItem: any, formGroup: FormGroup, isEdit?: boolean) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem?.lower_unit_uom_id)
    );
    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    if (selectedItem.item_main_price && selectedItem.item_main_price.length) {
      selectedItem.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(item.item_uom_id);
      });
      this.uoms.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
    }
    if (baseUomFilter.length && secondaryUomFilter.length) {
      itemArray = [...baseUomFilter, ...secondaryUomFilter];
    } else if (baseUomFilter.length) {
      itemArray = [...baseUomFilter];
    } else if (secondaryUomFilter.length) {
      itemArray = [...secondaryUomFilter];
    }
    formGroup.controls.item_uom_list.setValue(itemArray);
    if (isEdit) {
      uomControl.setValue(selectedItem?.item_uom_id);
    } else {
      if (baseUomFilter.length) {
        uomControl.setValue(selectedItem?.lower_unit_uom_id);
      } else {
        uomControl.setValue(secondaryUomFilter[0]?.id);
      }
    }
    // if (baseUomFilter.length) {
    //   uomControl.setValue(selectedItem.lower_unit_uom_id);
    // } else {
    //   uomControl.setValue(secondaryUomFilter[0].id);
    // }
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm || this.isDeliveryForm) {
      return formArray;
    }

    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        item_qty: new FormControl(1, [Validators.required]),
        item_uom_list: new FormControl([]),
        reason_id: new FormControl(null, [Validators.required]),
      })
    );

    return formArray;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    // this.itemNameSubscriptions.push(
    //   newFormGroup.controls['item'].valueChanges
    //     .pipe(
    //       distinctUntilChanged(
    //         (a, b) => JSON.stringify(a) === JSON.stringify(b)
    //       )
    //     )
    //     .pipe(
    //       startWith<string | Item>(''),
    //       map((value) => (typeof value === 'string' ? value : value.item_name)),
    //       map((value: string) => {
    //         return value;
    //       })
    //     ).subscribe((res) => {
    //       this.itemfilterValue = res || "";
    //       this.itempage = 1;
    //       this.itemlookup$.next(this.itempage)
    //     })
    // );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.controls['item_uom_id'].valueChanges.pipe(debounceTime(500)).subscribe(res => {
        this.loadChangesData(itemControls.value[index], itemControls, newFormGroup);
      }),
      newFormGroup.controls['item'].valueChanges.pipe(debounceTime(500)).subscribe(res => {
        this.loadChangesData(itemControls.value[index], itemControls, newFormGroup);
      }),
      newFormGroup.controls['item_qty'].valueChanges.pipe(debounceTime(500)).subscribe(res => {
        this.loadChangesData(itemControls.value[index], itemControls, newFormGroup);
      }),

      // newFormGroup.valueChanges
      //   .pipe(
      //     debounceTime(500),
      //     distinctUntilChanged(
      //       (a, b) => JSON.stringify(a) === JSON.stringify(b)
      //     )
      //   )
      //   .subscribe((result) => {
      //     console.log(result, itemControls.value[index], this.payloadItems[index]);
      //     //this.loadChangesData(result, itemControls, newFormGroup);
      //   })
    );
  }
  loadChangesData(result, itemControls, newFormGroup) {
    const groupIndex = itemControls.controls.indexOf(newFormGroup);
    if (
      newFormGroup.controls['item'].value &&
      newFormGroup.controls['item_uom_id'].value
    ) {
      const body: any = {
        item_id: result.item.id,
        item_uom_id: result.item_uom_id,
        item_qty: result.item_qty,
        customer_id: this.isDepotOrder
          ? null
          : this.customerFormControl.value.customer_infos_id,
        lob_id: this.isEditForm
          ? this.deliveryData?.lob_id
          : (this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || ""),
        depot_id: this.isDepotOrder ? this.depotFormControl.value : null,
      };
      if (!this.noFirstReqInEdit) {
        if (body.item_qty) {
          if (result.original_item_qty >= +body.item_qty) {
            this.subscriptions.push(
              this.orderService.getOrderItemStats(body).subscribe(
                (stats) => {
                  this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                    newFormGroup,
                    stats.data
                  );
                  this.generateOrderFinalStats(false, false);
                },
                () => {
                  this.commonToasterService.showError(
                    'Error in getting price detail'
                  );
                }
              )
            );
          } else {
            this.commonToasterService.showWarning(
              'Item QTY cannot be increased.!'
            );
          }
        } else {
          this.commonToasterService.showWarning(
            'Item QTY should atleast be 1'
          );
          this.payloadItems[groupIndex] = this.setupPayloadItemArray(
            newFormGroup,
            this.setupEmptyItemValue
          );
          this.generateOrderFinalStats(false, false);
        }
      } else {
        setTimeout(() => {
          this.noFirstReqInEdit = false;
        }, 1000);
      }
    } else {
      this.payloadItems[groupIndex] = this.setupPayloadItemArray(
        newFormGroup
      );
      this.generateOrderFinalStats(false, false);
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
      original_item_qty: 0,
      promotion_id: null,
      total: 0,
      total_excise: 0,
      total_net: 0,
      total_vat: 0,
      reason_id: 0
    };
  }
  setAll(checked) {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    itemControls.value.forEach((element, index) => {
      ((this.orderFormGroup.get('items') as FormArray).at(index) as FormGroup).get('is_picking').setValue(checked);

    });

  }
  changeQty(currentQty, originalItemQty, i) {
    if (+currentQty > +originalItemQty) {
      this.isQtyChange = true;
    } else if (+currentQty < +originalItemQty) {
      this.isQtyChange = true;
      ((this.orderFormGroup.get('items') as FormArray).at(i) as FormGroup).controls['reason_id'].enable();
    } else {
      this.isQtyChange = false;
      ((this.orderFormGroup.get('items') as FormArray).at(i) as FormGroup).get('reason_id').setValue(null);
    }

  }
  onSelectionChange(event, item) {
    this.isQtyChange = false;
    this.payloadItems.find(i => i.item.id === item.item.id).reason_id = event.option.value;
  }
  private setupDueDate(): void {
    const date = this.deliveryDateFormControl.value;
    const selectedTerm = this.terms.find(
      (term: PaymentTerms) => term.id === this.selectedPaymentTermId
    );
    if (!selectedTerm) return;
    var new_date = moment(date ? date : new Date())
      .add(selectedTerm.number_of_days, 'days')
      .format('YYYY-MM-DD');
    this.dueDateFormControl.setValue(new_date);
  }


  filterCustomers(customerName: string) {
    this.page = 1;
    this.filterValue = customerName.toLowerCase().trim() || "";
    // this.customers = [];
    this.filterCustomer = this.customers
      .filter(x => x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1 || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)
    // this.filterCustomer = [];
    // this.isLoading = true
    // this.lookup$.next(this.page)
  }


  fiterItems(value) {
    this.itemfilterValue = value.toLowerCase().trim() || "";
    this.itempage = 1;

    this.filteredItems = this.items
      .filter(x => x.item_code.toLowerCase().trim().indexOf(this.itemfilterValue) > -1 || x.item_name.toLowerCase().trim().indexOf(this.itemfilterValue) > -1)

    // this.items = [];
    // this.filteredItems = [];
    // this.isLoading = true;
    // this.itemlookup$.next(this.itempage)
  }
  fiterReason(value) {
    if (value !== '') {
      this.reasonsList = this.filterReason.filter(i => i.name.toLowerCase().trim().indexOf(value.toLowerCase().trim()) > -1);
    } else {
      this.reasonsList = this.filterReason;
    }
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  public checkFormValidation(): boolean {
    if (this.orderTypeFormControl.invalid) {
      Utils.setFocusOn('typeFormField');
      return false;
    }
    if (!this.isDepotOrder && this.customerFormControl.invalid) {
      Utils.setFocusOn('customerFormField');
      return false;
    }
    if (!this.isDepotOrder && this.customerLobFormControl.invalid) {
      return false;
    }
    if (this.isDepotOrder && this.depotFormControl.invalid) {
      Utils.setFocusOn('depotFormField');
      return false;
    }
    // if (this.salesmanFormControl.invalid) {
    //   Utils?.setFocusOn('salesmanFormField');
    //   return false;
    // }
    // if (this.paymentTermFormControl.invalid) {
    //   Utils.setFocusOn('termFormField');
    //   return false;
    // }
    return true;
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
      this.deliveryFinalStats.total_gross.value =
        this.deliveryFinalStats.total_gross.value + item.item_gross;
      this.deliveryFinalStats.total_vat.value =
        this.deliveryFinalStats.total_vat.value + item.item_vat;
      this.deliveryFinalStats.total_excise.value =
        this.deliveryFinalStats.total_excise.value + item.item_excise;
      this.deliveryFinalStats.total_net.value =
        this.deliveryFinalStats.total_net.value + item.item_net;
      this.deliveryFinalStats.total_discount_amount.value =
        this.deliveryFinalStats.total_discount_amount.value +
        item.item_discount_amount;
      this.deliveryFinalStats.grand_total.value =
        this.deliveryFinalStats.grand_total.value + item.item_grand_total;
      return;
    }

    this.orderFinalStats.total_gross.value =
      this.orderFinalStats.total_gross.value + item.item_gross;
    this.orderFinalStats.total_vat.value =
      this.orderFinalStats.total_vat.value + item.item_vat;
    this.orderFinalStats.total_excise.value =
      this.orderFinalStats.total_excise.value + item.item_excise;
    this.orderFinalStats.total_net.value =
      this.orderFinalStats.total_net.value + item.item_net;
    this.orderFinalStats.total_discount_amount.value =
      this.orderFinalStats.total_discount_amount.value +
      item.item_discount_amount;
    this.orderFinalStats.grand_total.value =
      this.orderFinalStats.grand_total.value + item.item_grand_total;
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: any
  ): OrderItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_qty: form.controls.item_qty.value,
      item_uom_id: form.controls.item_uom_id.value,
      discount_id: result && result.discount_id ? result.discount_id : null,
      promotion_id: result && result.promotion_id ? result.promotion_id : null,
      is_free: result ? result.is_free : false,
      is_item_poi: result ? result.is_item_poi : false,
      item_price: result && result.item_price ? this.checkIsCommaValue(result.item_price) : 0,
      item_discount_amount:
        result && result.discount ? this.checkIsCommaValue(result.discount) : 0,
      item_vat: result && result.total_vat ? this.checkIsCommaValue(result.total_vat) : 0,
      item_net: result && result.total_net ? this.checkIsCommaValue(result.total_net) : 0,
      total_net: result && result.net_gross ? this.checkIsCommaValue(result.net_gross) - this.checkIsCommaValue(result.discount) : 0,
      item_excise:
        result && result.total_excise ? this.checkIsCommaValue(result.total_excise) : 0,
      total_excise:
        result && result.net_excise ? this.checkIsCommaValue(result.net_excise) : 0,
      item_grand_total: result && result.total ? this.checkIsCommaValue(result.total) : 0,
      item_gross: result && result.net_gross ? this.checkIsCommaValue(result.net_gross) : 0,
      reason_id: form.controls.reason_id.value,
      reason: result && result.reason ? result.reason : null,
      original_item_qty: form.controls.original_item_qty.value ? +form.controls.original_item_qty.value : +form.controls.item_qty.value,
      is_picking: form.controls.is_picking.value,
    };
  }
  checkIsCommaValue(value) {
    if (typeof value == 'number' && !isNaN(value)) {
      if (Number.isInteger(value)) {
        return value;
      } else {
        return value;
      }
    } else {
      if (value.includes(',')) {
        return parseFloat(value.replace(/,/g, ''));
      } else {
        return parseFloat(value);
      }
    }
  }
  getItemStatus(items): boolean {
    let ordStatus: string = '';
    this.deliveryData['delivery_details'].forEach((item) => {
      if (item.item.id == items.value.item.id) {
        ordStatus = item.delivery_status;
      }
    });
    return this.getStatus(ordStatus);
  }

  getStatus(value: string): boolean {
    let status: boolean = false;
    switch (value) {
      case OrderUpdateProcess.Pending:
        status = false;
        break;
      case OrderUpdateProcess.PartialDeliver:
        status = false;
        break;
      case OrderUpdateProcess.PartialInvoice:
        status = true;
        break;
      case OrderUpdateProcess.InProcess:
        status = false;
        break;
      case OrderUpdateProcess.Accept:
        status = true;
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

  public postFinalOrder(target: string): void {
    const totalStats = {};
    Object.keys(this.orderFinalStats).forEach((key: string) => {
      totalStats[key] = this.orderFinalStats[key].value;
    });
    let body = this.orderFormGroup.value;
    delete body.salesman_id;
    body.items.forEach(element => {
      this.deliveryData.delivery_details.forEach(dd => {
        if (element.item.id === dd.item.id) {
          dd.is_picking = element.is_picking;

          // if (dd.reason) {
          //   dd.reason_id = dd.reason?.id;
          // }
        }
      });
    });
    // body.salesman_id = body.salesman_id[0]?.id
    let customer_id = this.customerFormControl.value.user_id
      ? +this.customerFormControl.value.user_id
      : null;
    const finalPayload = {
      order_id: null,
      customer_id: customer_id,
      lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
      storage_location_id: this.warehouseFormControl.value[0] && this.warehouseFormControl.value[0].id || "",
      delivery_type_source: ConvertDeliveryType.DirectDelivery,
      ...body,
      ...totalStats,
      // salesman_id: this.salesmanFormControl.value[0]?.id,
      delivery_number: this.deliveryNumber,
      delivery_time: this.deliveryTimeFormControl.value,
      current_stage_comment: 'pending',
      delivery_weight: 0,

      status: 1,
      source: 3,
    };

    this.payloadItems.forEach((item) => {
      item.is_free = false;
      item.is_item_poi = false;
    });
    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;
    finalPayload['storage_location_id'] = this.deliveryData.storage_location_id;
    finalPayload['warehouse_id'] = this.deliveryData.storage_location_id;
    const templateData = this.deliveryData['delivery_details'].filter(i => body.items.some(o => i.item_id === o.item.id));
    let itemSetModel = [];
    finalPayload.items.map(i => {
      templateData.forEach(element => {
        if (i.item_id == element.item_id) {
          const itemModel = {
            "id": element.id,
            "item": {
              "id": i.item.id,
              "code": i.item.item_code ? i.item.item_code : i.item.code ? i.item.code : null,
              "name": i.item.name
            },

            "item_id": i.item_id,
            "item_qty": i.item_qty,
            "item_uom_id": i.item_uom_id,
            "discount_id": i.discount_id,
            "promotion_id": element.promotion_id,
            "is_free": i.is_free,
            "is_item_poi": i.is_item_poi,
            "item_price": i.item_price,
            "item_discount_amount": i.item_discount_amount,
            "item_vat": i.item_vat,
            "item_net": i.item_net,
            "total_net": i.total_net,
            "item_excise": i.item_excise,
            "total_excise": i.total_excise,
            "item_grand_total": i.item_grand_total,
            "item_gross": i.item_gross,
            "batch_number": i.batch_number,
            "is_picking": element.is_picking === false ? 0 : 1,
            "is_deleted": element.is_deleted,
            "reason_id": i?.reason_id?.id ? i?.reason_id?.id : null,
            "item_weight": 0,
            "original_item_qty": i.original_item_qty,
            "template_order_id": element.template_order_id,
            "template_sold_to_outlet_id": element.template_sold_to_outlet_id,
            "template_item_id": element.template_item_id,
            "template_driver_id": element.template_driver_id,
            "template_order_number": element.template_order_number,
            "template_sold_to_outlet_code": element.template_sold_to_outlet_code,
            "template_sold_to_outlet_name": element.template_sold_to_outlet_name,
            "template_lpo_raised_date": element.template_lpo_raised_date,
            "template_raised_date": element.template_raised_date,
            "template_customer_lpo_no": element.template_customer_lpo_no,
            "template_item_name": element.template_item_name,
            "template_item_code": element.template_item_code,
            "template_total_value_in_case": element.template_total_value_in_case,
            "template_total_amount": element.template_total_amount,
            "template_delivery_sequnce": element.template_delivery_sequnce,
            "template_trip": element.template_trip,
            "template_trip_sequnce": element.template_trip_sequnce,
            "template_vechicle": element.template_vechicle,
            "template_driver_name": element.template_driver_name
          }

          itemSetModel.push(itemModel);
        }
      });
    });
    finalPayload.items = itemSetModel;
    finalPayload.delivery_type = finalPayload.delivery_type.id ? finalPayload.delivery_type.id : 2;
    this.finalOrderPayload = { ...finalPayload };

    if (this.isEditForm) {
      this.finalOrderPayload.order_id = this.deliveryData.order_id;
    }

    this.finalOrderPayload.items.forEach((item) => {
      item['batch_number'] = null;
    });
    this.makeOrderPostCall(target, this.finalOrderPayload);
  }
  getReasonId(item) {
    if (item.reason_id) {
      if (item.reason_id.id) {
        item['reason_id'] = item['reason_id']?.id
      } else {
        item['reason_id'] = item.reason_id;
      }
    } else {
      item['reason_id'] = null;
    }
    return item['reason_id'];
  }
  reasonHighlight(item, i) {
    let itemValue = item?.value;
    if (this.isQtyChange) {
      if (+itemValue.original_item_qty > +itemValue.item_qty && +itemValue.original_item_qty > 0) {
        return true;
        // } else if (+itemValue.original_item_uom_id != +itemValue.item_uom_id && +itemValue.original_item_uom_id > 0) {
        //   return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  private makeOrderPostCall(target: string, model: any): void {
    if (!this.checkFormValidation()) {
      return;
    }
    if (target === 'invoice') {
      this.subscriptions.push(
        this.deliveryService.addDelivery(model).subscribe(
          (result) => {
            if (result.status) {
              this.commonToasterService.showSuccess(
                '',
                'Delivery has been successfuly added. Generating invoice of delivery.'
              );
              this.router.navigate([
                'transaction/invoice/generate-invoice',
                result.data.uuid,
              ]);
            }
          },
          (error) => {
            this.commonToasterService.showError(
              'Failed creating delivery',
              'Please try again'
            );
          }
        )
      );
      return;
    } else if (target === 'delivery') {
      if (this.isEditForm) {
        this.subscriptions.push(
          this.deliveryService
            .editDelivery(this.deliveryData.uuid, model)
            .subscribe((result) => {
              this.commonToasterService.showSuccess(
                'Delivery edited sucessfully'
              );
              this.router.navigate(['transaction/delivery']);
            })
        );
      } else {
        this.subscriptions.push(
          this.deliveryService.addDelivery(model).subscribe(
            (result) => {
              this.commonToasterService.showSuccess(
                'Delivery added sucessfully'
              );
              this.router.navigate(['transaction/delivery']);
            },
            (error) => {
              this.commonToasterService.showError(
                'Failed converting to delivery',
                'Please try again'
              );
            }
          )
        );
      }
    }
  }

  openBulkItemSelectionPopup() {
    this.dialogRef.open(BulkItemModalComponent, {
      width: '900px',
      data: { title: `Are you sure want to delete this Salesman ?` }
    }).afterClosed().subscribe(data => {
      if (data.length > 0) {
        const itemControls = this.orderFormGroup.get('items') as FormArray;
        data.forEach(element => {
          const added = itemControls.value.find(
            (item) => item.item.id === element.item_id && item.is_free == true
          );
          if (added) return;
          element.name = element.item_name;
          element.item_price = element?.lower_unit_item_price;
          // element.discount = Number(element?.quantity || 0) * Number(element?.lower_unit_item_price);
          element.item_uom_id = element.selected_item_uom;
          element.item_qty = Number(element?.quantity || 0);
          element['is_free'] = false;
          this.addBulkItemForm(element);
          let item = { id: element.id, name: element.name };
          this.setItemBulk(element, itemControls.value.length - 1, true);
          const newFormGroup = itemControls.controls[itemControls.value.length - 1] as FormGroup;
          this.payloadItems[itemControls.value.length - 1] = this.setupPayloadItemArray(
            newFormGroup,
            element
          );
        });
      }
    });
  }

  public addBulkItemForm(item: any): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    itemControls.push(
      this.formBuilder.group({
        item: new FormControl(
          { id: item.id, name: item.name, item_code: item.item_code },
          [Validators.required]
        ),
        item_name: new FormControl(item.name,
          [Validators.required]
        ),
        item_uom_id: new FormControl(item.selected_item_uom, [Validators.required]),
        item_qty: new FormControl(item?.quantity, [Validators.required]),
        item_uom_list: new FormControl([item.item_uom_list]),
      })
    );

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }
  public setItemBulk(data: any, index: number, isFromEdit?: boolean): void {

    this.itemfilterValue = '';
    let selectedItem = data;
    selectedItem['lower_unit_uom_id'] = data?.item_uom_lower_unit?.id || 0;
    selectedItem['item_main_price'] = data?.item_main_price || [];
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    this.setUpRelatedUomBulk(selectedItem, itemFormGroup);
  }

  setUpRelatedUomBulk(selectedItem: any, formGroup: FormGroup) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem?.lower_unit_uom_id)
    );
    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    if (selectedItem.item_main_price && selectedItem.item_main_price.length) {
      selectedItem.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(item.item_uom_id);
      });
      this.uoms.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
    }
    if (baseUomFilter.length && secondaryUomFilter.length) {
      itemArray = [...baseUomFilter, ...secondaryUomFilter];
    } else if (baseUomFilter.length) {
      itemArray = [...baseUomFilter];
    } else if (secondaryUomFilter.length) {
      itemArray = [...secondaryUomFilter];
    }
    formGroup.controls.item_uom_list.setValue(itemArray);
    uomControl.setValue(selectedItem?.item_uom_id);
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
