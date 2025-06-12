
import { PAGE_SIZE_10 } from './../../../../../app.constant';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { formatDate, DatePipe } from '@angular/common';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
  ConvertDeliveryType,
  DeliveryPayload,
} from '../order-models';
import {
  getCurrency,
  getCurrencyDecimalFormat,
  getCurrencyFormat,
  getCurrencyDecimalFormatNew,
} from 'src/app/services/constants';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { Item } from '../../../master/item/item-dt/item-dt.component';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { BranchDepotMaster } from '../../../settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { Customer } from '../../../master/customer/customer-dt/customer-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { OrderTypeFormComponent } from '../order-type/order-type-form/order-type-form.component';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import { OrderService } from '../order.service';
import { PromotionDailogComponent } from '../../../../dialogs/promotion-dailog/promotion-dailog.component';
import * as moment from 'moment';
import { TokenizeResult } from '@angular/compiler/src/ml_parser/lexer';
import { MasterService } from '../../../master/master.service';
import { BulkItemModalComponent } from '../../bulk-item-modal/bulk-item-modal.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss'],
})
export class OrderFormComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('widgetsContent') widgetsContent: ElementRef;
  public todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  reason_index: any;
  isQtyChange = false;
  isDelete = false;
  isUom = false;
  // customerLPOFormControl: FormControl;
  // lpoExist = false;
  // isEditForm = false;
  reasonsList: any = [];
  filterReason: any = [];
  public dueDateSet: any;
  public pageTitle: string;
  public isEditForm: boolean;
  public isDeliveryForm: boolean;
  public uuid: string = '';
  public isDepotOrder: boolean;
  public orderNumber: string = '';
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  domain = window.location.host.split('.')[0];
  public orderData: OrderModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderFinalStats: {
    [key: string]: { label: string; value: any };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };
  public deliveryFinalStats: {
    [key: string]: { label: string; value: any };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      grand_total: { label: 'Invoice Total', value: 0 },
    };

  public orderFormGroup: FormGroup;
  public orderTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public itemControls: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public warehouseFormControl: FormControl;
  public noteFormControl: FormControl;
  public paymentTermFormControl: FormControl;
  public dueDateFormControl: FormControl;
  public deliveryDateFormControl: FormControl;
  public customerLPOFormControl: FormControl;

  public currentDate: any;

  public itemTableHeaders: ItemAddTableHeader[] = [];

  public orderTypes: OrderType[] = [];
  public items: any = [];
  public filteredItems: Item[] = [];
  public filterCustomer: Customer[] = [];
  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public salesmen: SalesMan[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedSalesmanId: number;
  public selectedPaymentTermId: number;
  public showConvertToDelivery: boolean = true;
  private router: Router;
  private apiService: ApiService;
  private masterService: MasterService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private elemRef: ElementRef;
  private finalOrderPayload: any = {};
  private finalDeliveryPayload: any = {};
  public nextCommingNumberofOrderCode: string;
  public is_lob: boolean = false;
  public selectedUOMs: number;
  orderNumberPrefix: any;
  customerLobList = [];
  creditLimit;
  filterValue = '';
  itemfilterValue = '';
  public page = 0;
  public pageEndNumber = 0;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  public freeItems = false;
  private noFirstReqInEdit = false;
  public isLoading: boolean;
  isCustomerlobShow: boolean = false;
  keyUp = new Subject<string>();
  keyUpItem = new Subject<string>();
  storageLocationList: any[] = [];
  nextCommingDeliveryCode: any;
  deliveryNumberPrefix: any;
  deliveryNumber: any;
  showLob = false;
  showWareHs = false;
  showReasons = false;
  itemsIds: any = [];
  storeId = '';
  ohqData: any = [];
  focusTdIndex = -1;
  isReasonDisabled = false;
  itemIndex = -1;
  lpoExist = false;
  checkPage = '';
  filterData: any;
  orderDetailsData: any = [];
  focusIndex = 0;
  constructor(
    private datePipe: DatePipe,
    private orderService: OrderService,
    apiService: ApiService,
    public dialog: MatDialog,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    masterService: MasterService,
    private CommonToasterService: CommonToasterService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    Object.assign(this, {
      apiService,
      masterService,
      dataService,
      dialogRef,
      elemRef,
      formBuilder,
      router,
      route,
      dialog,
    });

  }
  warehouseMappingDetails: any;

  async ngOnInit() {
    const today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate() + 1) < 10) {
      date = '0' + (today.getDate());
    }
    const currentDateandTime = new Date();
    const timestamp = currentDateandTime.getHours();

    const todayDate = new Date();
    if (timestamp >= 17) {
      todayDate.setDate(todayDate.getDate() + 2);
      this.currentDate = moment(todayDate)
        .format('YYYY-MM-DD');
    } else {
      todayDate.setDate(todayDate.getDate() + 1);
      this.currentDate = moment(todayDate)
        .format('YYYY-MM-DD');
    }
    this.isEditForm = this.router.url.includes('transaction/order/edit/');
    this.isDeliveryForm = this.router.url.includes(
      'transaction/order/start-delivery/'
    );
    this.getOrderData();
    this.orderData = this.route.snapshot.data['order'];
    this.dataService.newData.subscribe(res => {
      this.filterData = { ...res }
    })
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    if (this.isEditForm) {
      this.itemTableHeaders.find(i => i.key === 'reason').show = true;
    } else {
      this.itemTableHeaders.find(i => i.key === 'reason').show = false;
    }
    this.orderTypeFormControl = new FormControl(this.selectedOrderTypeId, [
      Validators.required,
    ]);
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
     this.customerLPOFormControl = new FormControl('', [
      Validators.maxLength(25) // Limit to 25 characters
    ]);
    this.salesmanFormControl = new FormControl(this.selectedSalesmanId);
    this.warehouseFormControl = new FormControl('');
    this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId);
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.itemControls = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl('', [Validators.required]);
    this.noteFormControl = new FormControl('', [Validators.required]);
    this.dueDateFormControl = new FormControl('', [Validators.required]);
    this.deliveryDateFormControl = new FormControl(this.currentDate, [Validators.required]);
    this.customerLPOFormControl = new FormControl('');
    this.orderFormGroup = this.formBuilder.group({
      order_type_id: this.orderTypeFormControl,
      payment_term_id: this.paymentTermFormControl,
      depot_id: this.depotFormControl,
      salesman_id: this.salesmanFormControl,
      any_comment: this.noteFormControl,
      due_date: this.dueDateFormControl,
      delivery_date: this.deliveryDateFormControl,
      items: this.initItemFormArray(),
    });
    this.isLoading = true;

    // this.subscriptions.push(
    //   this.masterService.itemDetailDDllistTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
    //     this.isLoading = false;
    //     this.itempage++;
    //     this.items = result.data;
    //     this.filteredItems = result.data;
    //     this.item_total_pages = result.pagination?.total_pages
    //   })
    // );
    // this.subscriptions.push(
    //   this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
    //     this.isLoading = false;
    //     this.itempage++;
    //     this.items = result.data;
    //     this.filteredItems = result.data;
    //     this.item_total_pages = result.pagination?.total_pages
    //   })
    // );

    // this.subscriptions.push(
    //   this.masterService.customerDetailDDlListTable({}).subscribe((result) => {
    //     this.customers = result.data;
    //     this.filterCustomer = result.data.slice(0, 30);

    //   })
    //   // this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
    //   //   this.page++;
    //   //   this.customers = result.data;
    //   //   this.filterCustomer = result.data;
    //   //   this.total_pages = result.pagination?.total_pages
    //   // })
    // );


    // const types = await this.apiService.getOrderTypes().toPromise();
    if (!this.isEditForm) {
      this.apiService.getOrderTypes().subscribe(types => {
        this.orderTypes = types && types.data;
      });
      this.subscriptions.push(
        this.apiService.getSalesMan().subscribe((result) => {
          this.salesmen = result.data;
        })
      );
      this.getDeliveryCode();
      this.getOrderCode();
      forkJoin([this.apiService.getAllDepots(), this.orderService.getPaymentTerm()]).subscribe(result => {
        this.depots = result[0].data;
        this.terms = result[1].data;
      });
    }
    // this.subscriptions.push(this.apiService.getOrderTypes().subscribe(result => {
    //   this.orderTypes = result.data
    // }));

    this.apiService.getReturnAllReasonsType().subscribe(res => {
      this.reasonsList = res.data;
      this.filterReason = [...this.reasonsList];
    });

    this.masterService.customerDetailDDlListTable({}).subscribe((result) => {
      this.customers = result.data;
      this.filterCustomer = result.data.slice(0, 30);
    })
    this.masterService.itemList().subscribe((result) => {
      this.itempage++;
      this.items = result.data;
      this.filteredItems = result.data;
      // this.item_total_pages = result.pagination?.total_pages
    })
    // this.items = this.route.snapshot.data['resolved'].items.data;
    // this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    // this.customers = this.route.snapshot.data['resolved'].customers.data;
    // this.filterCustomer = this.route.snapshot.data['resolved'].customers.data;
    // this.total_pages = this.route.snapshot.data['resolved'].customers.pagination?.total_pages;
    // this.orderTypes = this.route.snapshot.data['resolved'].types.data;
    if (this.isEditForm || this.isDeliveryForm) {
      this.noFirstReqInEdit = true;
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = this.isEditForm ? 'Edit Order' : 'Customize Delivery';
      this.orderData = this.route.snapshot.data['order'];
      this.setupEditFormControls(this.orderData);
      this.customerLPOFormControl.setValue(this.orderData.customer_lop)
    } else {
      this.pageTitle = 'Add Order';
      this.addItemFilterToControl(0);
    }

    if (this.isDeliveryForm) {
      this.deliveryDateFormControl.disable();
      this.dueDateFormControl.disable();
    }

    this.subscriptions.push(
      // this.customerFormControl.valueChanges
      //   .pipe(
      //     debounceTime(500),
      //     startWith<string | Customer>(''),
      //     map((value) => (typeof value === 'string' ? value : value?.user?.firstname)),
      //     map((value: string) => {
      //       return value;
      //     })
      //   ).subscribe((res) => {
      //     this.filterValue = res || "";
      //     this.lookup$.next(this.page)
      //   })
    );

    // this.subscriptions.push(
    //   this.itemControls.valueChanges
    //     .pipe(
    //       debounceTime(500),
    //       startWith<string | Item>(''),
    //       map((value) => (typeof value === 'string' ? value : value?.item_name)),
    //       map((value: string) => {
    //         debugger
    //         return value;
    //       })
    //     ).subscribe((res) => {
    //       this.filterValue = res || "";
    //       this.itemlookup$.next(this.page)
    //     })
    // )

    // this.subscriptions.push(
    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailDDlListTable({ search: this.filterValue.toLowerCase() })

        // return this.masterService.customerDetailListTable({ name: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.customers = res.data;
        this.filterCustomer = res.data.slice(0, 30);
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
        //   this.page = 1;
        //   this.customers = res.data;
        //   this.filterCustomer = res.data;
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
        //    if (this.itemfilterValue == "") {
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
      })
    // )


    this.getOrderStatus();
    this.deliveryDateFormControl.valueChanges.subscribe(() => {
      this.setupDueDate();
    });
    this.warehouseFormControl.valueChanges.subscribe(res => {
      if (res.length > 0) {
        this.storeId = res[0].id;
        this.getOnHoldQty();
      }
    });

    this.customerLobFormControl.valueChanges.subscribe(res => {

      if (res.length > 0) {
        this.isCustomerlobShow = true;
        if (this.customerLobList.length > 0) {
          var paymentTermId = this.customerLobList.find(x => x.lob_id == res[0].id)?.payment_term_id;
          let findCustomerLOBByWarehouse = this.customerLobList.find(i => i.lob_id == res[0].id);
          if (!this.isEditForm) {
            if (findCustomerLOBByWarehouse.customer_type) {
              const findType = this.orderTypes.find(i => i.name.toLowerCase() === findCustomerLOBByWarehouse.customer_type.customer_type_name.toLowerCase());
              this.orderTypeFormControl.patchValue(findType.id);
            }
          }
          this.apiService.getWarehouse(res[0].id).subscribe(x => {
            this.storageLocationList = x.data;
            if (this.orderData?.storage_location_id) {
              // var storageArray = this.storageLocationList.find(sl => sl.id == this.orderData.storage_location_id || sl.id == findCustomerLOBByWarehouse.customer_warehouse_mapping.storageocation.id);
              // if (storageArray) {
              let obj = { id: this.orderData.storageocation.id, itemName: this.orderData.storageocation.code + ' - ' + this.orderData.storageocation.name };
              this.warehouseFormControl.setValue([obj]);
              // }
            } else {
              if (findCustomerLOBByWarehouse.customer_warehouse_mapping.length > 0) {
                let checkIsStorageAvailable = this.storageLocationList.find(i => i.id === findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storage_location_id);
                if (checkIsStorageAvailable) {
                  let obj = { id: findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storageocation?.id, itemName: findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storageocation?.code + ' - ' + findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storageocation?.name };
                  this.warehouseFormControl.setValue([obj]);
                } else {
                  let obj = { id: null, itemName: null };
                  this.warehouseFormControl.patchValue([obj]);
                }
              } else {
                let obj = { id: null, itemName: null };
                this.warehouseFormControl.patchValue([obj]);
              }
            }
          });
          this.paymentTermFormControl.patchValue(paymentTermId);
          this.selectedPaymentTermId = paymentTermId;
          this.payTermChanged(paymentTermId);
        }
      }
      // this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);

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

  }

  getItemDetailByName(name) {
    return this.masterService
      .itemDetailListTable({ id: name, })

  }
  getOHQValue(item) {
    const d1 = this.ohqData.find(i => Number(i.item_id) == Number(item?.item.id));
    if (d1) {
      return d1.item_qty;
    } else {
      return 0;
    }
  }
  getOnHoldQty() {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    const itemIds = [];
    itemControls.value.forEach(element => {
      if (element.item) {
        itemIds.push({ item_id: element.item.id, item_uom_id: element.item_uom_id });
      }
    });
    if (this.storeId && itemIds.length > 0) {
      const model = {
        "storage_id": this.storeId,
        "items": itemIds
      }
      // this.orderService.getOHQ(model).subscribe(res => {
      //   this.ohqData = res.data;

      // })
    }
  }

  getOrderData() {
    this.route.params.subscribe(re => {
      if (re?.uuid) {
        this.orderService.getOrderById(re.uuid).subscribe(res => {
          this.orderDetailsData = res.data?.order_details;
        })
      }
    })
    // this.orderService.getOrderById(this.route.params.u)
  }

  onScroll() {

    var totalPages = this.customers.length / 30;
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



  getOrderStatus() {
    if (this.isEditForm) {
      let orderStatus = this.getStatus(this.orderData.current_stage);
      orderStatus
        ? (this.showConvertToDelivery = false)
        : (this.showConvertToDelivery = true);
    } else {
      this.showConvertToDelivery = true;
    }
  }

  public get filteredTableHeaders(): ItemAddTableHeader[] {
    return [...this.itemTableHeaders].filter((item) => item.show);
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'order',
    };
    this.orderService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofOrderCode = res.data.number_is;
        this.orderNumberPrefix = res.data.prefix_is;
        if (this.nextCommingNumberofOrderCode) {
          this.orderNumber = this.nextCommingNumberofOrderCode;
        } else if (this.nextCommingNumberofOrderCode == null) {
          this.nextCommingNumberofOrderCode = '';
          this.orderNumber = '';
        }
      } else {
        this.nextCommingNumberofOrderCode = '';
        this.orderNumber = '';
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Order Code',
      functionFor: 'order',
      code: this.orderNumber,
      prefix: this.orderNumberPrefix,
      key: this.orderNumber.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.orderNumber = '';
          this.nextCommingNumberofOrderCode = '';
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.orderNumber = res.data.next_coming_number_order;
          this.nextCommingNumberofOrderCode = res.data.next_coming_number_order;
          this.orderNumberPrefix = res.reqData.prefix_code;
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    // this.orderTypeChanged(editData.order_type_id);
    if (editData.salesman) {
      let selectedSalesman = [{ id: editData.salesman.salesman_id, itemName: editData.salesman.salesman_name }];
      this.salesmanFormControl.setValue(editData.salesman.salesman_id);
    }

    // this.salesmanFormControl.setValue(
    //   editData.salesman ? editData.salesman.salesman_id : ''
    // );
    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find(
        (cust) => cust.user_id === editData.customer.customer_id
      );
    this.filteredCustomers.push(customer);
    this.orderNumber = editData.order_number;
    this.selectedOrderTypeId = editData.order_type_id;
    this.selectedDepotId = editData.depot && editData.depot.depot_id;
    this.selectedPaymentTermId = editData.payment_term_id;
    this.paymentTermFormControl.setValue(editData.payment_term_id);
    this.orderTypeFormControl.setValue(editData.order_type_id);

    if (editData.customerObj?.user) {
      if (editData.customerObj?.user?.customer_info) {
        editData.customerObj['customer_infos_id'] = editData.customerObj?.user?.customer_info.id
      }
    }

    this.customerFormControl.setValue(editData.customerObj);
    this.getCustomerLobList(editData.customer, editData);
    this.noteFormControl.setValue(editData.customer_note);
    this.dueDateFormControl.setValue(editData.due_date);
    this.deliveryDateFormControl.setValue(editData.delivery_date);
    // this.salesmanChanged(editData.sales);
    if (editData.lob) {
      this.isCustomerlobShow = true;
    }
    editData.items.forEach((item: OrderItemsPayload, index: number) => {
      this.addItemForm(item);
      this.itemDidSearched(item, index, true);
      // this.itemsIds.push(item.item.id);
      const itemStats = this.payloadItems[index];
      Object.keys(this.payloadItems[index]).forEach((key) => {
        itemStats[key] = item[key];
      });

    });
    this.getOnHoldQty();
    Object.keys(this.orderFinalStats).forEach((key) => {
      this.orderFinalStats[key].value = editData[key];
    });
  };

  openLOB() {
    this.showLob = true;
  }
  openWarehouse() {
    this.showWareHs = true;
  }

  getCustomerLobList(customer, editData?) {
    this.filterValue = "";
    let paymentTermId
    if (this.isEditForm && editData) {
      paymentTermId = editData?.payment_term_id;
    } else {
      paymentTermId = customer?.payment_term_id;
    }
    if (customer?.is_lob == 1 || editData?.lob) {
      this.is_lob = true;
      this.selectedPaymentTermId = paymentTermId
      // this.customerLobFormControl.setValidators([Validators.required]);
      // this.customerLobFormControl.updateValueAndValidity();
      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
          let customerLob = [{ id: this.orderData?.lob_id, itemName: this.orderData?.lob?.name }];
          this.customerLobFormControl.setValue(customerLob);
        } else {
          this.showLob = true;
          this.showWareHs = true;
          this.customerLobFormControl.setValue([]);
          this.warehouseFormControl.setValue([]);
        }
      });
    }
    else {
      this.is_lob = false;
      this.customerLobFormControl.clearValidators();
      this.customerLobFormControl.updateValueAndValidity();
      this.selectedPaymentTermId = paymentTermId
      this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
    }

  }
  getItemOHQ(id) {
    if (id) {
      const d1 = this.ohqData.find(i => i.item_id == +id);
      if (d1) {
        return d1.qty;
      }
    }
  }
  createItemFormGroup(item, isBulk = false) {
    let group;
    if (item && isBulk) {
      group = new FormGroup({
        item: new FormControl({ id: item.id, name: item.name, item_code: item.item_code }, [
          Validators.required,
        ]),
        item_name: new FormControl(item.name, [
          Validators.required,
        ]),
        item_uom_id: new FormControl(+item.selected_item_uom, [Validators.required]),
        item_qty: new FormControl(item?.quantity, [Validators.required]),
        item_weight: new FormControl(0, [Validators.required]),
        item_uom_list: new FormControl([item.item_uom_list]),
        is_free: new FormControl(item?.is_free || false),
        reason_id: new FormControl({ value: item.reason ? { id: item.reason.id, name: item.reason.name, type: item.reason.type, code: item.reason.code } : null, disabled: true }, [Validators.required]),
        is_deleted: new FormControl(item.is_deleted ? item.is_deleted : 0),
        original_item_qty: new FormControl(item.original_item_qty ? +item.original_item_qty : 0),
        original_item_price: new FormControl(item.original_item_price ? +item.original_item_price : 0),
        original_item_uom_id: new FormControl(item.original_item_uom_id ? +item.original_item_uom_id : 0),
        item_update: new FormControl(item.item_update ? +item.item_update : 0)
      });

    }
    else if (item && !isBulk) {
      group = new FormGroup({
        item: new FormControl({ id: item.item.id, name: item.item.item_name, item_code: item.item.item_code }, [
          Validators.required,
        ]),
        item_name: new FormControl(item.item.name, [
          Validators.required,
        ]),
        item_uom_id: new FormControl(+item.item_uom_id, [Validators.required]),
        item_qty: new FormControl(item.item_qty, [Validators.required]),
        item_weight: new FormControl(0, [Validators.required]),
        item_uom_list: new FormControl([item.uom_info]),
        is_free: new FormControl(item?.is_free || false),
        reason_id: new FormControl({ value: item.reason ? { id: item.reason.id, name: item.reason.name, type: item.reason.type, code: item.reason.code } : null, disabled: true }, [Validators.required]),
        is_deleted: new FormControl(item.is_deleted),
        original_item_qty: new FormControl(+item.original_item_qty),
        original_item_price: new FormControl(item.original_item_price ? +item.original_item_price : null),
        original_item_uom_id: new FormControl(+item.original_item_uom_id),
        item_update: new FormControl(+item.item_update)

      });
    } else {
      group = new FormGroup({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        item_qty: new FormControl(1, [Validators.required]),
        item_weight: new FormControl(0, [Validators.required]),
        item_uom_list: new FormControl([]),
        is_free: new FormControl(false),
        reason_id: new FormControl(null, [Validators.required]),
        is_deleted: new FormControl(0),
        original_item_qty: new FormControl(0),
        original_item_price: new FormControl(0),
        original_item_uom_id: new FormControl(0),
        item_update: new FormControl(0)
      });
    }

    // group.valueChanges.pipe(first()).subscribe((response) => {
    //   this.getPromotion(response);
    // });

    return group;
  }
  getReason(item) {
    const selectedReason = item.reason ? [{ id: item.reason.id, name: item.reason.name }] : [];

  }
  public addItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    let group = this.createItemFormGroup(item);
    itemControls.push(group);

    this.addItemFilterToControl(itemControls.controls.length - 1, true);
  }

  public getPromotion(data, index?): void {

    if (data) {
      let items = this.itemFormControls.filter((x) => x?.value?.is_free == false);
      let itemsLength = items.length;
      let itemids = [];
      let itemuomids = [];
      let itemqtys = [];
      items.forEach((itemgroup) => {
        if (itemgroup && !itemgroup?.value?.is_free) {
          itemgroup.value.item.id && itemids.push(itemgroup.value.item.id);
          itemgroup.value.item_uom_id && itemuomids.push(itemgroup.value.item_uom_id);
          itemgroup.value.item_qty && itemqtys.push(itemgroup.value.item_qty);
        }
      })
      const model = {
        item_id: itemids,//[data.item.id],
        item_uom_id: itemuomids,//[data.item_uom_id],
        item_qty: itemqtys,//[data.item_qty],
        customer_id: this.customerFormControl.value?.customer_infos_id,
      };
      if (!model.item_id.length) return;
      this.orderService
        .getPromotionItems(model)
        .pipe()
        .subscribe((result) => {
          if (
            result &&
            result.data &&
            result.data.itemPromotionInfo.length > 0
          ) {
            const status = result.data.itemPromotionInfo[0].offer_item_type;
            if (status == 'Any') {
              this.openPromotionPopup(result.data, itemsLength);
            } else {
              const itemControls = this.orderFormGroup.get('items') as FormArray;
              itemControls.value.map(
                (item) => { item.is_free === true && this.deleteItemRow(itemControls.value.findIndex(x => x.is_free === true)) }
              );
              result.data.offer_items.forEach((element) => {
                const added = itemControls.value.find(
                  (item) => item.item.id === element.item_id && item.is_free == true
                );
                this.freeItems = true;
                if (added) return;
                element.item.name = element.item.item_name;
                element.item_price = element?.item?.lower_unit_item_price;
                element.discount = Number(element.offered_qty) * Number(element?.item?.lower_unit_item_price);
                element.item_qty = Number(element.offered_qty);
                element['is_free'] = true;
                this.addItemForm(element);
                let item = { id: element.item.id, name: element.item.name };
                this.itemDidSearched(element, itemControls.value.length - 1, true);
                const newFormGroup = itemControls.controls[itemControls.value.length - 1] as FormGroup;
                this.payloadItems[itemControls.value.length - 1] = this.setupPayloadItemArray(
                  newFormGroup,
                  element
                );
              });
            }
          } else {
            const itemControls = this.orderFormGroup.get('items') as FormArray;
            itemControls.value.map(
              (item) => { item.is_free === true && this.deleteItemRow(itemControls.value.findIndex(x => x.is_free === true)) }
            );
          }
        });
    }
  }

  public openPromotionPopup = (promotion, index) => {
    this.dialog
      .open(PromotionDailogComponent, {
        width: '600px',
        height: 'auto',
        data: {
          title: 'Promotions',
          data: promotion,
        },
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        const itemControls = this.orderFormGroup.get('items') as FormArray;
        // itemControls.value.map(
        //   (item) => { item.is_free === true && this.deleteItemRow(itemControls.value.findIndex(x => x.is_free === true)) }
        // );
        if (res && res.length > 0) {
          this.dialog.closeAll();
          res.forEach((element) => {
            const added = itemControls.value.find(
              (item) => item.item.id === element.item_id && item.is_free == true
            );
            this.freeItems = false;
            if (added) {
              // let indexOf = itemControls.value.indexOf(added);
              // let qty = parseInt(added.item_qty) + 1;
              // itemControls.at(indexOf).get("item_qty").setValue(qty);
              return;
            }
            element.item.name = element.item.item_name;
            element.item_price = element?.item?.lower_unit_item_price;
            element.discount = Number(element.offered_qty) * Number(element?.item?.lower_unit_item_price);
            element.item_qty = Number(element.offered_qty);
            element['is_free'] = true;
            this.addItemForm(element);

            let item = { id: element.item.id, name: element.item.name };
            this.itemDidSearched(element, itemControls.value.length - 1, true);
            const newFormGroup = itemControls.controls[itemControls.value.length - 1] as FormGroup;
            this.payloadItems[itemControls.value.length - 1] = this.setupPayloadItemArray(
              newFormGroup,
              element
            );
          });
        }
      });
  };

  public orderTypeChanged(id: number): void {
    if (id) {
      // this.orderTypeFormControl.setValue(id);
      this.selectedOrderType = this.orderTypes.find((type) => type.id === id);
      this.isDepotOrder =
        this.selectedOrderType?.use_for.toLowerCase() !== 'customer';
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

  public goBackToOrdersList(): void {
    this.router.navigate(['transaction/order']);
  }

  public goToOrder(): void {
    this.postFinalOrder('order');
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
    if (this.widgetsContent) {
      this.widgetsContent.nativeElement.scrollLeft -= 400;
      this.filteredItems = this.items;
      this.addItemForm();
    }
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

  public itemControlValue(item: any): any {
    return { id: item.item_id, name: item.item.item_name, item_code: item.item.item_code };
  }

  public reasonValue(reason) {
    return { id: reason.id, name: reason.name, type: reason.type, code: reason.code };
  }
  public reasonControlDisplayValue(reason?: {
    id: string;
    name: string;
    code: string
  }): string | undefined {
    return reason?.name ? reason.code + ' - ' + reason.name : '';
  }
  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
    item_code: string;
  }): string | undefined {
    return item ? item.item_code ? item.item_code : '' + " " + item.name : undefined;
  }

  public customerControlDisplayValue(customer: any): string {
    if (customer?.user) {
      return `${customer?.user?.customer_info?.customer_code ? customer?.user?.customer_info?.customer_code : ''} ${customer?.user?.firstname ? customer?.user?.firstname + ' ' + customer?.user?.lastname : ''} `

    } else
      return `${customer?.customer_code ? customer?.customer_code : ''} ${customer?.name ? customer?.name : ''} `
  }
  public openDeleteBox(index: number): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete this item?`,
          isReason: null
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteItemRow(index);
        }
      });
  }

  public deleteItemRow(index: number): void {

    const itemControls = this.orderFormGroup.get('items') as FormArray;
    let selectedItemIndex: number;
    let isSelectedItemDelete = false;
    if (this.selectedPayloadItems.length) {
      const selectedItem = this.selectedPayloadItems.find(
        (item: OrderItemsPayload, i: number) =>
          item.item_id === itemControls.value[index].item.id
      );
      selectedItemIndex = this.selectedPayloadItems.indexOf(selectedItem);
      if (selectedItemIndex >= 0) {
        this.selectedPayloadItems.splice(selectedItemIndex, 1);
        isSelectedItemDelete = true;
      }
    }
    if (this.isEditForm) {
      const checkIndex = this.orderData.items[index];
      if (checkIndex) {
        this.isUom = true;
        this.reason_index = index;
        this.isDelete = true;
        this.isQtyChange = false;
        this.payloadItems[index].is_deleted = 1;
        ((this.orderFormGroup.get('items') as FormArray).at(index) as FormGroup).get('is_deleted').setValue(1);
        ((this.orderFormGroup.get('items') as FormArray).at(index) as FormGroup).controls['reason_id'].enable();
      } else {
        this.payloadItems.splice(index, 1);
        itemControls.removeAt(index);
      }
      ((this.orderFormGroup.get('items') as FormArray).at(index) as FormGroup).get('item_qty').setValue(0);
    } else {
      itemControls.removeAt(index);
      this.payloadItems.splice(index, 1);
    }

    // this.itemNameSubscriptions.splice(index, 1);
    // this.itemControlSubscriptions.splice(index, 1);
    // this.payloadItems.splice(index, 1);
    //  this.generateOrderFinalStats(true, isSelectedItemDelete);
  }

  onSelectionChange(event, item) {
    this.reason_index = null;
    this.isDelete = false;
    this.isQtyChange = false;
    this.isUom = false;
    this.payloadItems.find(i => i.item.id === item.item.id).reason_id = event.option.value;
  }
  public itemDidSearched(data: any, index: number, isFromEdit?: boolean): void {
    if (isFromEdit) {
      const selectedItem: any = data;
      this.itemfilterValue = '';
      selectedItem['item_uom_lower_unit'] = selectedItem?.item?.item_uom_lower_unit;
      selectedItem['item_main_price'] = selectedItem?.item?.item_main_price || [];
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      this.setItemRelatedUOM(selectedItem, itemFormGroup, true);
      // this.setUpRelatedUom(selectedItem, itemFormGroup);
    } else if (!isFromEdit) {
      this.getItemDetailByName(data.id).subscribe(res => {
        var _items = res.data || [];
        const selectedItem: any = _items.find((res1: any) => res1.id == data.id);
        const itemFormGroup = this.itemFormControls[index] as FormGroup;
        const itemnameControl = itemFormGroup.controls.item_name;
        if (itemnameControl) itemnameControl.setValue(data.name);
        this.setItemRelatedUOM(selectedItem, itemFormGroup, false);
      });

    }
    this.addItem();
    this.focusIndex++;
  }
  setItemRelatedUOM(selectedItem: any, formGroup: FormGroup, isEdit?: boolean) {
    const uomControl = formGroup.controls.item_uom_id;
    let lowerUnitUOM = [selectedItem.item_uom_lower_unit];
    let baseUnitUOM = [];
    let itemUOMArray = [];
    if (selectedItem.item_main_price.length > 0) {
      selectedItem.item_main_price.forEach(element => {
        baseUnitUOM.push(element.item_uom);
      });
      itemUOMArray = [...baseUnitUOM, ...lowerUnitUOM];
    } else {
      itemUOMArray = lowerUnitUOM;
    }
    formGroup.controls.item_uom_list.setValue(itemUOMArray);
    if (isEdit) {
      uomControl.setValue(selectedItem?.uom_info?.id);
    } else {
      let checkUOM: any;
      let checkMainUOM: any;
      let checkSecUOM: any;
      if (selectedItem.is_secondary === 1) {
        checkUOM = selectedItem.item_uom_lower_unit;
        uomControl.setValue(checkUOM?.id);
      } else {
        // checkMainUOM = selectedItem.item_main_price.find(i => +i.item_shipping_uom === 1);
        checkMainUOM = selectedItem.item_main_price.find(i => +i.is_secondary === 1);
        if (checkMainUOM) {
          uomControl.setValue(checkMainUOM.item_uom_id);
        } else {
          checkSecUOM = selectedItem.item_main_price.find(i => +i.is_secondary === 1);
          if (checkSecUOM) {
            uomControl.setValue(checkSecUOM.item_uom_id);
          } else {
            uomControl.setValue(selectedItem?.lower_unit_uom_id);
          }
        }
      }
    }

  }

  setUpRelatedUom(selectedItem: any, formGroup: FormGroup, isEdit?: boolean) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;

    this.apiService.getAllItemUoms().subscribe((result) => {
      this.uoms = result.data;
      const baseUomFilter = this.uoms.filter(
        (item) => item?.id == parseInt(selectedItem?.lower_unit_uom_id ? selectedItem?.lower_unit_uom_id : selectedItem?.item_uom_lower_unit.id)
      );

      let secondaryUomFilterIds = [];
      let secondaryUomFilter = [];
      if (selectedItem?.item_main_price && selectedItem?.item_main_price?.length) {
        selectedItem?.item_main_price.forEach((item) => {
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

      if (selectedItem?.is_free) {
        itemArray = selectedItem.item_uom ? [selectedItem.item_uom] : [selectedItem.uom_info];
      }
      formGroup.controls.item_uom_list.setValue(itemArray);

      if (isEdit) {
        setTimeout(() => {
          if (baseUomFilter.length) {
            uomControl.setValue(selectedItem?.item_uom_id);
          }
        }, 500);
      } else {
        if (baseUomFilter.length) {
          setTimeout(() => {
            uomControl.setValue(selectedItem?.lower_unit_uom_id);
          }, 500);
        } else {
          setTimeout(() => {
            uomControl.setValue(secondaryUomFilter[0]?.id);
          }, 500);
        }
      }
    })

  }

  public postFinalOrder(target: string): void {
    const items = this.payloadItems.filter((x) => +x.item_price !== 0 || +x.item_price === 0 && +x.is_deleted === 0 );
    if (items.length !== 0) {
      const totalStats = {};
      Object.keys(this.orderFinalStats).forEach((key: string) => {
        totalStats[key] = this.orderFinalStats[key].value;
      });
      let body = this.orderFormGroup.value;
      // body.salesman_id = body.salesman_id[0] && body.salesman_id[0]?.id || '';
      const finalPayload = {
        customer_id: this.customerFormControl.value.user_id,
        lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
        storage_location_id: this.warehouseFormControl.value[0] && this.warehouseFormControl.value[0].id || "",
        ...body,
        ...totalStats,
        order_number: this.orderNumber,

        source: 3,
      };
      // this.payloadItems.forEach((item) => {
      //   item.is_free = false;
      //   item.is_item_poi = false;
      // });
      finalPayload.items = this.payloadItems;
      // finalPayload.items = items;
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
      this.finalOrderPayload['customer_lop'] = this.customerLPOFormControl.value;
      if (this.isDelete && this.isQtyChange == false) {
        this.CommonToasterService.showInfo(
          'Please Select Reason'
        );
      } else if (this.isQtyChange && this.isDelete === false) {
        this.CommonToasterService.showInfo(
          'Please Select Reason'
        );
      } else {
        this.makeOrderPostCall(target);
      }
    } else {
      this.CommonToasterService.showInfo(
        'Please remove the 0 price item from order to proceed.'
      );
    }
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm || this.isDeliveryForm) {
      return formArray;
    }
    const group = this.createItemFormGroup(null);
    formArray.push(group);
    return formArray;
  }

  private addItemFilterToControl(index: number, is_free?): void {
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
    //       // this.itemfilterValue = res || "";
    //       // this.itempage = 1;
    //       // this.items = [];
    //       // this.filteredItems = [];
    //       // this.isLoading = true;
    //       // this.itemlookup$.next(this.itempage)
    //     })
    // );
    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);
    this.itemControlSubscriptions.push(
      newFormGroup.controls['item_uom_id'].valueChanges.pipe(debounceTime(500)).subscribe(res => {
        this.getOrderItemStats(itemControls, newFormGroup, res, false);
      }),
      newFormGroup.controls['item'].valueChanges.pipe(debounceTime(500)).subscribe(res => {
        this.getOrderItemStats(itemControls, newFormGroup, res, false);
      }),
      newFormGroup.controls['item_qty'].valueChanges.pipe(debounceTime(500)).subscribe(res => {
        this.getOrderItemStats(itemControls, newFormGroup, res, false);
      }),

      // newFormGroup.valueChanges
      //   .pipe(
      //     debounceTime(500),
      //     distinctUntilChanged(
      //       (a, b) => JSON.stringify(a) === JSON.stringify(b)
      //     )
      //   )
      //   .subscribe((result) => {
      //     this.getOrderItemStats(itemControls, newFormGroup, res, false);
      //   })
    );
  }

  checkLPOExist(lop) {
   
    let body = {
      "customer_lop": lop,
      "customer_id": this.customerFormControl.value.id
    }
    this.apiService.checkLPOOrder(body).subscribe(res => {
      this.lpoExist = false;
    }, error => {
      this.lpoExist = true;
    });
  }

  getOrderItemStats(itemControls, newFormGroup, result, isBulk) {
    const groupIndex = itemControls.controls.indexOf(newFormGroup);
    if (
      newFormGroup.controls['item'].value &&
      newFormGroup.controls['item_uom_id'].value
    ) {
      var body: any;
      body = {
        item_id: +newFormGroup.controls['item'].value.id,
        item_uom_id: +newFormGroup.controls['item_uom_id'].value,
        item_qty: +newFormGroup.controls['item_qty'].value,
        customer_id: this.isDepotOrder
          ? ''
          : (this.customerFormControl.value?.customer_infos_id),
        lob_id: this.isDepotOrder
          ? ''
          : (this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || ""),
        depot_id: this.isDepotOrder ? this.depotFormControl.value : '',
        delivery_date: this.deliveryDateFormControl.value ? this.deliveryDateFormControl.value : ''
      };
      if (!this.freeItems && !this.noFirstReqInEdit) {
        if (body.item_qty > 0) {
          if (!body.item_id) return;
          // this.getPromotion(result);
          if (this.isEditForm) {
            // if (+newFormGroup.controls['original_item_qty'].value >= +body.item_qty || +newFormGroup.controls['original_item_qty'].value == 0) {
            // if (+newFormGroup.controls['item_update'].value > +body.item_qty || +result.original_item_qty == 0) {
            this.subscriptions.push(
              this.orderService.getOrderItemStats(body).subscribe(
                (stats) => {
                  this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                    newFormGroup,
                    stats.data
                  );
                  this.generateOrderFinalStats(false, false);
                },
                (error) => {
                  console.error(error);
                }
              )
            );
            // } else if (+newFormGroup.controls['item_update'].value < +body.item_qty) {
            //   this.CommonToasterService.showWarning(
            //     'Item QTY cannot be increased.!'
            //   );
            // }
          } else {
            this.subscriptions.push(
              this.orderService.getOrderItemStats(body).subscribe(
                (stats) => {
                  this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                    newFormGroup,
                    stats.data
                  );
                  this.generateOrderFinalStats(false, false);
                },
                (error) => {
                  console.error(error);
                }
              )
            );
          }
        } else {
          this.CommonToasterService.showWarning(
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
          this.freeItems = false;
          this.noFirstReqInEdit = false;
        }, 1000);
      }
      this.getOnHoldQty();
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
      original_item_qty: 0,
      original_item_price: 0,
      original_item_uom_id: 0,
      item_qty: 0,
      promotion_id: null,
      total: 0,
      total_excise: 0,
      total_net: 0,
      total_vat: 0,
      reason_id: null,
      item_weight: 0
    };
  }
  addHighlight(index) {
    this.focusTdIndex = index;
  }
  removeHighlight(index) {
    this.focusTdIndex = index;
  }

  changeUOM() {
    this.isUom = true;
  }

  reasonHighlight(item, i) {

    let itemValue = item?.value;
    if (this.isUom && this.reason_index == i) {
      if (itemValue?.is_deleted == 1) {
        return true;
      } else if (+itemValue.original_item_qty > +itemValue.item_qty && +itemValue.original_item_qty > 0) {
        return true;
      } else if (+itemValue.original_item_uom_id != +itemValue.item_uom_id && +itemValue.original_item_uom_id > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  }
  changeUOMItem(item, i) {
    let itemValue = item?.value;
    if (+itemValue.original_item_uom_id != +itemValue.item_uom_id && +itemValue.original_item_uom_id > 0) {
      this.isUom = true;
      ((this.orderFormGroup.get('items') as FormArray).at(i) as FormGroup).controls['reason_id'].enable();
    } else {
      ((this.orderFormGroup.get('items') as FormArray).at(i) as FormGroup).get('reason_id').patchValue(null);
      ((this.orderFormGroup.get('items') as FormArray).at(i) as FormGroup).get('reason_id').disable;
      this.isUom = false;
    }

    this.reason_index = i;
  }
  changeQty(currentQty, originalItemQty, i) {
    if (+originalItemQty != 0) {
      // if (+currentQty > +originalItemQty) {
      //   this.isQtyChange = true;
      //   this.isUom = true;
      // } else
      if (+currentQty < +originalItemQty) {
        this.isQtyChange = true;
        this.isUom = true;
        ((this.orderFormGroup.get('items') as FormArray).at(i) as FormGroup).controls['reason_id'].enable();
      } else {
        this.isQtyChange = false;
        this.isUom = false;
        ((this.orderFormGroup.get('items') as FormArray).at(i) as FormGroup).get('reason_id').setValue(null);
      }
    }
    this.itemIndex = i;
    this.reason_index = i;

  }
  fiterItems(value) {
    this.isLoading = true;
    if (value !== '') {
      this.itemfilterValue = value.toLowerCase().trim() || "";
      // this.filteredItems = this.items
      //   .filter(x => x.item_code.toLowerCase().trim().indexOf(this.itemfilterValue) > -1 || x.item_name.toLowerCase().trim().indexOf(this.itemfilterValue) > -1)
      this.filteredItems = this.items.filter(x =>
        x.item?.item_code.toLowerCase().trim() === this.itemfilterValue || x.item?.item_name.toLowerCase().trim() === this.itemfilterValue);
      if (this.filteredItems.length == 1) {
        this.isLoading = false;
      }
    } else {
      this.filteredItems = this.items;
    }
  }
  fiterReason(value) {
    if (value !== '') {
      this.reasonsList = this.filterReason.filter(i => i.name?.toLowerCase()?.trim().includes(value?.toLowerCase()?.trim()) || i?.code?.toLowerCase()?.trim().includes(value?.toLowerCase()?.trim()));
    } else {
      this.reasonsList = this.filterReason;
    }
  }

  private setupDueDate(): void {
    const date = this.deliveryDateFormControl.value;
    const selectedTerm = this.terms.find(
      (term: PaymentTerms) => term.id === this.selectedPaymentTermId
    );
    var new_date = moment(date ? date : new Date())
      .add(selectedTerm?.number_of_days, 'days')
      .format('YYYY-MM-DD');
    this.dueDateFormControl.setValue(new_date);
  }



  filterCustomers(customerName: string) {
    this.page = 1;
    this.filterValue = customerName.toLowerCase().trim() || "";
    // this.customers = [];
    this.filterCustomer = this.customers
      .filter(x =>
        x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1
        || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)


    // this.filterCustomer = [];
    // this.isLoading = true
    // this.lookup$.next(this.page)
  }



  public checkFormValidation(target: string = null): boolean {
    // if (this.orderTypeFormControl.invalid) {
    //   Utils.setFocusOn('typeFormField');
    //   return false;
    // }
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
    if (target == 'orderDelivery') {
      if (!this.salesmanFormControl.value || this.salesmanFormControl.value.length == 0) {
        Utils.setFocusOn('salesmanFormField');
        return false;
      }
    }
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
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;

    this.payloadItems.forEach((item: OrderItemsPayload) => {

      item.item_excise = this.checkIsCommaValue(item.item_excise);
      item.item_grand_total = this.checkIsCommaValue(item.item_grand_total);
      item.item_gross = this.checkIsCommaValue(item.item_gross);
      item.item_net = this.checkIsCommaValue(item.item_net);
      this.sumUpFinalStats(item);
    });
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  setOrderNumber(value) {
    this.orderNumber = value;
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
        this.deliveryFinalStats.total_excise.value + Number(item.item_excise);
      this.deliveryFinalStats.total_net.value =
        this.deliveryFinalStats.total_net.value + Number(item.total_net);
      this.deliveryFinalStats.total_discount_amount.value =
        this.deliveryFinalStats.total_discount_amount.value +
        item.item_discount_amount;
      this.deliveryFinalStats.grand_total.value =
        this.deliveryFinalStats.grand_total.value + item.item_grand_total;
      return;
    }
    this.orderFinalStats.total_gross.value =
      this.checkIsCommaValue(this.orderFinalStats.total_gross.value) + this.checkIsCommaValue(item.item_gross);
    this.orderFinalStats.total_vat.value =
      this.checkIsCommaValue(this.orderFinalStats.total_vat.value) + this.checkIsCommaValue(item.item_vat);
    this.orderFinalStats.total_excise.value =
      this.checkIsCommaValue(this.orderFinalStats.total_excise.value) + (this.checkIsCommaValue(item.item_excise) * item.item_qty);
    this.orderFinalStats.total_net.value =
      this.checkIsCommaValue(this.orderFinalStats.total_net.value ? this.orderFinalStats.total_net.value : 0) + this.checkIsCommaValue(item.total_net);
    this.orderFinalStats.total_discount_amount.value =
      this.checkIsCommaValue(this.orderFinalStats.total_discount_amount.value)
      + this.checkIsCommaValue(item.item_discount_amount);
    this.orderFinalStats.grand_total.value =
      this.checkIsCommaValue(this.orderFinalStats.grand_total.value) + this.checkIsCommaValue(item.item_grand_total);
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: any,
  ): OrderItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_code: form.controls.item.value?.item_code || '',
      item_qty: form.controls.item_qty.value,
      item_uom_id: +form.controls.item_uom_id.value,
      discount_id: result && result.discount_id ? result.discount_id : null,
      promotion_id: result && result.promotion_id ? result.promotion_id : null,
      is_free: form.controls.is_free.value || result?.is_free,
      is_item_poi: result?.is_item_poi || false,
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
      reason_id: form.controls.reason_id.value ? form.controls.reason_id.value : null,
      reason: result && result.reason ? result.reason : null,
      original_item_qty: form.controls.original_item_qty.value ? form.controls.original_item_qty.value : +form.controls.item_qty.value,
      original_item_price: form.controls.original_item_price.value ? form.controls.original_item_price.value : 0,
      item_weight: result && result.item_weight ? result.item_weight : 0,
      is_deleted: form.controls.is_deleted.value,
      original_item_uom_id: form.controls.original_item_uom_id.value,
      item_update: result && result.item_update ? +result.item_update : 0
    };
  }

  getItemStatus(items): boolean {
    let ordStatus: string = '';
    this.orderData.items.forEach((item, i) => {
      if (item.item.id == items.value.item.id) {
        ordStatus = item.order_status;
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
      case OrderUpdateProcess.InProcess:
        status = false;
        break;
      case OrderUpdateProcess.Accept:
        status = true;
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

  private makeOrderPostCall(target: string): void {
    if (!this.checkFormValidation(target)) {
      return;
    }

    if (target === 'delivery') {
      this.subscriptions.push(
        this.orderService.addNewOrder(this.finalOrderPayload).subscribe(
          (result1) => {
            this.CommonToasterService.showSuccess(
              '',
              'Order has been successfuly added. Converting order to delivery.'
            );
            this.router.navigate([
              'transaction/order/start-delivery',
              result1.data.uuid,
            ]);
          },
          (error) => {
            this.CommonToasterService.showError(
              'Failed adding order',
              'Cannot add order, please try again'
            );
            this.router.navigate(['transaction/order/add']);
          }
        )
      );
    } else if (target === 'order' || target === 'orderDelivery') {
      if (this.isEditForm) {
        const itemControls = this.orderFormGroup.controls['items'] as FormArray;
        this.finalOrderPayload.items.forEach((item, index) => {
          // let newitem = JSON.parse(JSON.stringify(item['item']));
          item['item_code'] = item.item.item_code;
          item['promotion_id'] = null;
          item['reason'] = null;
          item['id'] = this.orderDetailsData[index] ? this.orderDetailsData[index].id : '';
          item['uuid'] = this.orderDetailsData[index] ? this.orderDetailsData[index].uuid : '';
          if (item.reason_id) {
            if (item.reason_id.id) {
              item['reason_id'] = item['reason_id']?.id
            } else {
              item['reason_id'] = item.reason_id;
            }
          }
          item['item_weight'] = item.item.item_weight;
        });
        //   // item.item.item_code = undefined;
        //   const checkItem = itemControls.value.find(i => i?.item?.id === item?.item?.id);
        //   if (checkItem) {
        //     item['item_weight'] = checkItem.item_weight;
        //     if (checkItem.reason_id) {
        //       item['is_deleted'] = checkItem.is_deleted
        //     } else {
        //       item['is_deleted'] = checkItem.is_deleted
        //     }
        //   }
        //   item['item_code'] = newitem.item_code;

        //   item['total_net'] = item.item_net;
        //   item['total_excise'] = item.item_excise;
        // });


        this.subscriptions.push(
          this.orderService
            .editOrder(this.orderData.uuid, this.finalOrderPayload)
            .subscribe(
              (result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Order has been updated successfully'
                );
                if (this.filterData.type === 'view') {
                  this.router.navigate(['transaction/order/view']);
                  this.dataService.sendData(this.filterData);
                } else {
                  this.router.navigate(['transaction/order']);
                }

              },
              (error) => {
                this.CommonToasterService.showError(
                  'Failed updating order',
                  'Please try again'
                );
              }
            )
        );
      } else {
        this.subscriptions.push(
          this.orderService.addNewOrder(this.finalOrderPayload).subscribe(
            (result) => {
              this.CommonToasterService.showSuccess(
                'Order added',
                'Order has been added successfully'
              );
              this.router.navigate(['transaction/order']);
            },
            (error) => {
              this.CommonToasterService.showError(
                'Failed adding order',
                'Please try again'
              );
              this.router.navigate(['transaction/order/add']);
            }
          )
        );
      }
    }
  }

  getDeliveryCode() {
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

  postDelivery(payload: any) {

    const totalStats = {};
    Object.keys(this.deliveryFinalStats).forEach((key: string) => {
      if (key == 'gross_total') {
        totalStats['total_gross'] = this.deliveryFinalStats[key].value;
      } else {
        totalStats[key] = this.deliveryFinalStats[key].value;
      }
    });
    var currentTime = moment(new Date())
      .format('hh:mm');
    const finalPayload: any = {
      order_id: this.orderData.id,
      customer_id: payload.customer_id,
      lob_id: this.orderData.lob_id,
      salesman_id: this.salesmanFormControl.value[0]?.id,
      storage_location_id: this.warehouseFormControl.value[0] && this.warehouseFormControl.value[0].id || "",
      delivery_number: this.deliveryNumber,
      delivery_date: this.orderData.delivery_date,
      delivery_time: currentTime,
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

    finalPayload.items = this.finalDeliveryPayload.items;
    finalPayload['total_qty'] = this.finalDeliveryPayload.items.length;
    finalPayload['grand_total'] = this.finalDeliveryPayload.grand_total
    finalPayload['total_discount_amount'] = this.finalDeliveryPayload.total_discount_amount
    finalPayload['total_excise'] = this.finalDeliveryPayload.total_excise
    finalPayload['total_gross'] = this.finalDeliveryPayload.total_gross
    finalPayload['total_net'] = this.finalDeliveryPayload.total_net
    finalPayload['total_vat'] = this.finalDeliveryPayload.total_vat
    this.orderService.postDelivery(finalPayload).subscribe(
      (res: any) => {
        if (res.status) {
          this.CommonToasterService.showSuccess(
            'Delivery',
            'Order Sucessfully converted to Delivery'
          );
          this.router.navigate(['transaction/delivery']);
        }
      },
      (error) => {
        this.CommonToasterService.showError(
          'Delivery',
          'Failed Converting Order to Delivery, Please try again!!!'
        );
      }
    );
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
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
  openBulkItemSelectionPopup() {
    this.dialogRef.open(BulkItemModalComponent, {
      width: '1000px',
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
          //   this.getOrderItemStats(itemControls, newFormGroup, element, true);

        });
      }
    });
  }
  public addBulkItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    itemControls.value.forEach((element, index) => {
      if (!element.item) {
        const d1 = this.orderFormGroup.get('items') as FormArray;
        this.payloadItems.splice(index, 1);
        itemControls.removeAt(index);
      }
    });
    let group = this.createItemFormGroup(item, true);
    itemControls.push(group);
    this.addItemFilterToControl(itemControls.controls.length - 1, true);
  }
  public setItemBulk(data: any, index: number, isFromEdit?: boolean): void {


    this.itemfilterValue = '';
    // const selectedItem = this.items.find(
    //   (item: Item) => item.id === data.item_id
    // );
    let selectedItem = data;
    selectedItem['lower_unit_uom_id'] = data?.item_uom_lower_unit?.id || 0;
    selectedItem['item_main_price'] = data?.item_main_price || [];
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    // const uomControl = itemFormGroup.controls.item_uom_id;
    // let IsEdit = true;
    // if (selectedItem?.is_free) {
    //   IsEdit = false
    // }
    this.setUpRelatedUomBulk(selectedItem, itemFormGroup);


  }

  setUpRelatedUomBulk(selectedItem: any, formGroup: FormGroup) {
    const uomControl = formGroup.controls.item_uom_id;
    let lowerUnitUOM = [selectedItem.item_uom_lower_unit];
    let baseUnitUOM = [];
    let itemUOMArray = [];
    if (selectedItem.item_main_price.length > 0) {
      selectedItem.item_main_price.forEach(element => {
        baseUnitUOM.push(element.item_uom);
      });
      itemUOMArray = [...baseUnitUOM, ...lowerUnitUOM];
    } else {
      itemUOMArray = lowerUnitUOM;
    }
    formGroup.controls.item_uom_list.setValue(itemUOMArray);
    let checkUOM: any;
    let checkMainUOM: any;
    let checkSecUOM: any;
    if (selectedItem.is_secondary === 1) {
      checkUOM = selectedItem.item_uom_lower_unit;
      uomControl.setValue(checkUOM?.id);
    } else {
      checkMainUOM = selectedItem.item_main_price.find(i => +i.is_secondary === 1);
      if (checkMainUOM) {
        uomControl.setValue(checkMainUOM.item_uom_id);
      } else {
        checkSecUOM = selectedItem.item_main_price.find(i => +i.is_secondary === 1);
        if (checkSecUOM) {
          uomControl.setValue(checkSecUOM.item_uom_id);
        } else {
          uomControl.setValue(selectedItem?.lower_unit_uom_id);
        }
      }
    }

  }
  getStorageLocationName(data) {
    if (data.name) {
      return data.code + ' - ' + data.name;
    } else {
      return 'Select Option';
    }
  }
  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }
  

}

export const ITEM_ADD_FORM_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 1, key: 'item', label: 'Item Code', show: true },
  { id: 2, key: 'itemName', label: 'Item Name', show: true },
  { id: 3, key: 'uom', label: 'UOM', show: true },
  { id: 4, key: 'qty', label: 'Quantity', show: true },
  { id: 5, key: 'reason', label: 'Reason', show: false },
  { id: 6, key: 'price', label: 'Price', show: true },
  { id: 7, key: 'excise', label: 'Excise', show: true },
  { id: 8, key: 'discount', label: 'Discount', show: true },
  { id: 9, key: 'vat', label: 'Vat', show: true },
  { id: 10, key: 'net', label: 'Net', show: true },
  { id: 11, key: 'total', label: 'Total', show: true },
  { id: 12, key: 'weight', label: 'Weight', show: false },
  { id: 13, key: 'ohq', label: 'On Hand Qty', show: false },
];

