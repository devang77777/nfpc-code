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
import { MatDialog } from '@angular/material/dialog';
import { formatDate, DatePipe } from '@angular/common';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';

import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { BranchDepotMaster } from 'src/app/components/main/settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
  ConvertInvoiceType,
  ConvertDeliveryType,
} from 'src/app/components/main/transaction/orders/order-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { OrderTypeFormComponent } from 'src/app/components/main/transaction/orders/order-type/order-type-form/order-type-form.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { InvoiceServices } from '../invoice.service';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import * as moment from 'moment';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { PromotionDailogComponent } from 'src/app/components/dialogs/promotion-dailog/promotion-dailog.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MasterService } from '../../../master/master.service';
import { BulkItemModalComponent } from '../../bulk-item-modal/bulk-item-modal.component';
@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  public todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  public dueDateSet: any;
  public pageTitle: string;
  public isEditForm: boolean;
  public isDeliveryForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public invoiceNumber: string = '';
  isCustomerlobShow: boolean = false;
  showWareHs = false;
  public orderData: OrderModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  itemQtyAvlaible = [];
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Total Gross', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };
  public deliveryFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Total Gross', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };

  public currentDate: any;

  public orderFormGroup: FormGroup;
  public orderTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public warehouseFormControl: FormControl;
  public noteFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public paymentTermFormControl: FormControl;
  public dueDateFormControl: FormControl;
  public deliveryDateFormControl: FormControl;
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public creditLimit;
  public terms: PaymentTerms[] = [];
  public salesmen: SalesMan[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  storageLocationList: any[] = [];
  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedPaymentTermId: number;
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
  private finalOrderPayload: any = {};
  private finalDeliveryPayload: any = {};
  public nextCommingNumberofInvoiceCode: string = '';
  public showConvertToDelivery: boolean;
  public is_lob: boolean = false;
  nextCommingNumberofInvoiceCodePrefix: any;
  customerLobList = [];
  public filterCustomer: Customer[] = [];
  isLoading: boolean;
  filterValue = '';
  public page = 0;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  itemfilterValue = '';
  public freeItems = false;
  storeId = '';
  ohqData: any = [];
  private noFirstReqInEdit = false;
  keyUp = new Subject<string>();
  keyUpItem = new Subject<string>();
  constructor(
    private datePipe: DatePipe,
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    private invoiceServices: InvoiceServices,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    private masterService: MasterService,
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

    this.isEditForm = this.router.url.includes('invoice/edit/');
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;

    this.orderTypeFormControl = new FormControl(this.selectedOrderTypeId, [
      Validators.required,
    ]);
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
    this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId, [
      Validators.required,
    ]);
    this.salesmanFormControl = new FormControl('', [Validators.required])
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl('', [Validators.required]);
    this.warehouseFormControl = new FormControl('');
    this.noteFormControl = new FormControl('', [Validators.required]);
    this.dueDateFormControl = new FormControl('', [Validators.required]);
    this.deliveryDateFormControl = new FormControl(this.currentDate, [Validators.required]);


    this.orderFormGroup = this.formBuilder.group({
      invoice_type: this.orderTypeFormControl,
      payment_term_id: this.paymentTermFormControl,
      salesman_id: '',
      depot_id: this.depotFormControl,
      any_comment: this.noteFormControl,
      invoice_due_date: this.dueDateFormControl,
      invoice_date: this.deliveryDateFormControl,
      items: this.initItemFormArray(),
    });
    this.subscriptions.push(
      this.masterService.itemDetailDDllistTable({}).subscribe((result) => {
        this.itempage++;
        this.items = result.data;
        this.filteredItems = result.data;
        this.item_total_pages = result.pagination?.total_pages
      })
    );
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    //this.customers = this.route.snapshot.data['resolved'].customers.data;
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
    //this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    this.orderTypes = this.route.snapshot.data['resolved'].types.data;
    this.deliveryDateFormControl.valueChanges.subscribe(() => {
      this.setupDueDate();
    });
    if (this.isEditForm) {
      this.noFirstReqInEdit = true;
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Invoice';
      this.orderData = this.route.snapshot.data['editResolve'];

      if (this.orderData) {
        this.setupEditFormControls(this.orderData);
        window.localStorage.removeItem('deliveryData');
      } else {
        this.router.navigate(['transaction/delivery']);
      }
    } else {
      this.pageTitle = 'Add Invoice';
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

    this.subscriptions.push(
      this.apiService.getPaymenterms().subscribe((result) => {
        this.terms = result.data;
      })
    );
    this.getOrderCode();
    this.getOrderStatus();

    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailDDlListTable({ search: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.customers = res.data;
        this.filterCustomer = res.data;
        //  if (this.filterValue == "") {
        //   if (this.page > 1) {
        //     this.customers = [...this.customers, ...res.data];
        //     this.filterCustomer = [...this.filterCustomer, ...res.data];
        //   } else {

        //   }
        //   this.page++;
        //   this.total_pages = res?.pagination?.total_pages;
        // } else {
        //   this.page = 1;
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

        // if (this.itemfilterValue == "") {
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


    this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(res => {
      console.log("res", res)
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
        delay(500),
      )),
    ).subscribe(res => {
      console.log("res", res)
      if (!res) {
        res = '';
      }
      this.fiterItems(res);
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
          const paymentTermId = this.customerLobList.find(x => x.lob_id == res[0].id)?.payment_term_id;
          const findCustomerLOBByWarehouse = this.customerLobList.find(i => i.lob_id == res[0].id);
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
              const obj = { id: this.orderData.storageocation.id, itemName: this.orderData.storageocation.code + ' - ' + this.orderData.storageocation.name };
              this.warehouseFormControl.setValue([obj]);
              // }
            } else {
              if (findCustomerLOBByWarehouse.customer_warehouse_mapping.length > 0) {
                const checkIsStorageAvailable = this.storageLocationList.find(i => i.id === findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storage_location_id);
                if (checkIsStorageAvailable) {
                  const obj = { id: findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storageocation?.id, itemName: findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storageocation?.code + ' - ' + findCustomerLOBByWarehouse?.customer_warehouse_mapping[0]?.storageocation?.name };
                  this.warehouseFormControl.setValue([obj]);
                } else {
                  const obj = { id: null, itemName: null };
                  this.warehouseFormControl.patchValue([obj]);
                }
              } else {
                const obj = { id: null, itemName: null };
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
      };
      // this.orderService.getOHQ(model).subscribe(res => {
      //   this.ohqData = res.data;
      // });
    }
  }
  getCustomerLobList(customer, editData?) {
    this.filterValue = "";
    this.page = 1;
    // this.lookup$.next(this.page);
    let paymentTermId;
    if (this.isEditForm && editData) {
      paymentTermId = editData?.payment_term_id;
    } else {
      paymentTermId = customer?.payment_term_id;
    }
    console.log(customer);
    if (customer?.is_lob == 1 || editData?.lob) {
      this.is_lob = true;
      this.customerLobFormControl.setValidators([Validators.required]);
      this.customerLobFormControl.updateValueAndValidity();


      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          setTimeout(() => {
            this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
            let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
            this.customerLobFormControl.setValue(customerLob);
          }, 1000);
        }
      })
    }
    else {
      this.is_lob = false;
      this.customerLobFormControl.clearValidators();
      this.customerLobFormControl.updateValueAndValidity();
      this.selectedPaymentTermId = customer.payment_term_id;
      this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
    }
  }
  onScroll() {
    var totalPages = this.customers.length / 30;
    if (this.filterCustomer.length == this.customers.length) return;
    this.page = this.page + 30;
    var pageEndNumber = 30 + this.page;
    this.filterCustomer = [...this.filterCustomer, ...this.customers.slice(this.page, pageEndNumber)]

  }

  onScrollItem() {
    console.log(this.item_total_pages, this.itempage)
    if (this.item_total_pages < this.itempage) return;
    this.isLoading = true;
    this.itemlookup$.next(this.page);
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

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'invoice',
    };
    this.invoiceServices.nexCommingNumber(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofInvoiceCode = res.data.number_is;
        this.nextCommingNumberofInvoiceCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofInvoiceCode) {
          this.invoiceNumber = this.nextCommingNumberofInvoiceCode;
        } else if (this.nextCommingNumberofInvoiceCode == null) {
          this.nextCommingNumberofInvoiceCode = '';
          this.invoiceNumber = '';
        }
      } else {
        this.nextCommingNumberofInvoiceCode = '';
        this.invoiceNumber = '';
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Order Code',
      functionFor: 'invoice',
      code: this.nextCommingNumberofInvoiceCode,
      prefix: this.nextCommingNumberofInvoiceCodePrefix,
      key: this.nextCommingNumberofInvoiceCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.invoiceNumber = '';
          this.nextCommingNumberofInvoiceCode = '';
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.invoiceNumber = res.data.next_coming_number_invoice;
          this.nextCommingNumberofInvoiceCode =
            res.data.next_coming_number_invoice;
          this.nextCommingNumberofInvoiceCodePrefix = res.reqData.prefix_code;
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    console.log(editData);
    this.orderTypeChanged(editData.order_type_id);
    if (editData.salesman) {
      let selectedSalesman = [{ id: editData.salesman.salesman_id, itemName: editData.salesman.salesman_name }];
      console.log(selectedSalesman);
      this.salesmanFormControl.setValue(selectedSalesman);
    }

    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find((cust) => cust.user_id === editData['customer_id']);
    this.filteredCustomers.push(customer);
    this.selectedOrderTypeId = editData.order_type_id;
    this.selectedDepotId = editData['depot_id'];
    this.selectedPaymentTermId = editData.payment_term_id;
    this.paymentTermFormControl.setValue(editData.payment_term_id);

    editData.customerObj = { id: editData.user?.customer_info?.id, user: editData.user, user_id: editData.user?.customer_info?.user_id, customer_code: editData.user?.customer_info?.customer_code };
    editData.customer = editData.user?.customer_info?.id
      ? {
        customer_id: editData.user?.customer_info?.id,
        user_id: editData.user?.customer_info?.user_id,
        customer_name: editData.user
          ? editData.user.firstname + ' ' + editData.user.lastname
          : 'Unknown',
      }
      : undefined;

    this.customerFormControl.setValue(editData.customerObj);
    this.getCustomerLobList(editData.customer, editData);
    let customerLob = [{ id: editData.lob_id, itemName: editData.lob?.lob_name }]
    this.customerLobFormControl.setValue(customerLob);
    this.deliveryDateFormControl.setValue(editData['invoice_date']);
    this.noteFormControl.setValue(editData.customer_note);
    this.dueDateFormControl.setValue(editData['invoice_due_date']);
    if (editData.lob) {
      this.isCustomerlobShow = true;
    }
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    itemControls.controls.length = 0;
    editData['invoices'].forEach((item: OrderItemsPayload, index: number) => {
      this.addItemForm(item);
      this.itemDidSearched(item, index, true);
      const itemStats = this.payloadItems[index];
      Object.keys(this.payloadItems[index]).forEach((key) => {
        itemStats[key] = item[key];
      });
    });

    Object.keys(this.orderFinalStats).forEach((key) => {
      this.orderFinalStats[key].value = editData[key];
    });
  }

  public addItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    console.log(item);
    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(
            { id: item?.item.id, code: item?.item.item_code, name: item?.item.item_name },
            [Validators.required]
          ),
          item_name: new FormControl(item?.item['item_name'], [Validators.required]),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          item_qty: new FormControl(item.item_qty, [Validators.required]),
          item_uom_list: new FormControl([item.uom_info]),
          is_free: new FormControl(item?.is_free || false)
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
          is_free: new FormControl(false)
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
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
        customer_id: this.customerFormControl.value?.id,
      };
      if (!model.item_id.length) return;
      this.invoiceServices
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
                const itemControls = this.orderFormGroup.get(
                  'items'
                ) as FormArray;
                const added = itemControls.value.find(
                  (item) => item.item.id === element.item_id && item.is_free == true
                );
                if (added) return;
                element.item.name = element.item.item_name;
                element.item_price = element?.item?.lower_unit_item_price;
                element.discount = Number(element.offered_qty) * Number(element?.item?.lower_unit_item_price);
                element.item_qty = Number(element.offered_qty);
                element['is_free'] = true;
                this.addItemForm(element);
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

  public isStockCheck(data) {
    let customer = this.customerFormControl.value;
    const model = {
      item_id: data.item.id,
      item_uom_id: data.item_uom_id,
      item_qty: data.item_qty,
      route_id: customer.is_lob == 1 ? customer?.customerlob[0]?.route_id : customer?.route_id,
    };
    if (!model.item_id) return;
    this.apiService
      .isStockCheck(model)
      .pipe()
      .subscribe((result) => {
        this.itemQtyAvlaible[data.item.id] = result.data;
      }, err => {
        this.itemQtyAvlaible[data.item.id] = err?.error?.data;
      })
  }

  public openPromotionPopup = (promotion, index) => {
    this.dialogRef
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
        itemControls.value.map(
          (item) => { item.is_free === true && this.deleteItemRow(itemControls.value.findIndex(x => x.is_free === true)) }
        );
        if (res && res.length > 0) {
          this.dialogRef.closeAll();
          res.forEach((element) => {
            const added = itemControls.value.find(
              (item) => item.item.id === element.item_id && item.is_free == true
            );
            this.freeItems = true;
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
            this.itemDidSearched(item, itemControls.value.length - 1);
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
      this.orderTypeFormControl.setValue(id);
      this.selectedOrderType = this.orderTypes.find((type) => type.id === id);
      if (this.selectedOrderType) {
        this.isDepotOrder =
          this.selectedOrderType.use_for.toLowerCase() !== 'customer';
      }
    }
  }

  public depotChanged(id: number): void {
    this.selectedDepotId = id;
    this.depotFormControl.setValue(id);
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
    this.router.navigate(['transaction/invoice']);
  }
  goBackToInvoiceList() {
    this.router.navigate(['transaction/invoice']);
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

  public get filteredTableHeaders(): ItemAddTableHeader[] {
    return [...this.itemTableHeaders].filter((item) => item.show);
  }

  public itemControlValue(item: Item): { id: string; name: string; code: string } {
    return { id: item.id, name: item.item_name, code: item.item_code };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
    code: string;
  }): string | undefined {
    return item ? item.code ? item.code : '' + " " + item.name : undefined;
  }

  public customerControlDisplayValue(customer: any): string {

    if (customer?.user) {
      return `${customer?.user?.customer_info?.customer_code ? customer?.user?.customer_info?.customer_code : ''} ${customer?.user?.firstname ? customer?.user?.firstname + ' ' + customer?.user?.lastname : ''} `

    } else
      return `${customer?.customer_code ? customer?.customer_code : ''} ${customer?.name ? customer?.name : ''} `

    // return customer
    // ? customer.user.firstname + ' ' + customer.user.lastname
    // : '';

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
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      this.setUpRelatedUom(selectedItem, itemFormGroup, true);
    } else if (!isFromEdit) {
      this.getItemDetailByName(data.name).subscribe(res => {
        var items = res.data;
        const selectedItem: any = items.find((res: any) => res.id === data.id);
        //  const selectedItem = this.items.find((item: Item) => item.id === data.id);
        const itemFormGroup = this.itemFormControls[index] as FormGroup;
        const uomControl = itemFormGroup.controls.item_uom_id;
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
    formGroup.controls.item_uom_list.setValue(itemArray);
    if (isEdit) {
      setTimeout(() => {
        uomControl.setValue(selectedItem?.item_uom_id);
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

  }

  // setUpRelatedUom(selectedItem: any, formGroup: FormGroup) {
  //   let itemArray: any[] = [];
  //   const uomControl = formGroup.controls.item_uom_id;
  //   const baseUomFilter = this.uoms.filter(
  //     (item) => item.id == parseInt(selectedItem.lower_unit_uom_id)
  //   );
  //   let secondaryUomFilterIds = [];
  //   let secondaryUomFilter = [];
  //   if (selectedItem.item_main_price && selectedItem.item_main_price.length) {
  //     selectedItem.item_main_price.forEach((item) => {
  //       secondaryUomFilterIds.push(item.item_uom_id);
  //     });
  //     this.uoms.forEach((item) => {
  //       if (secondaryUomFilterIds.includes(item.id)) {
  //         secondaryUomFilter.push(item);
  //       }
  //     });
  //   }

  //   if (baseUomFilter.length && secondaryUomFilter.length) {
  //     itemArray = [...baseUomFilter, ...secondaryUomFilter];
  //   } else if (baseUomFilter.length) {
  //     itemArray = [...baseUomFilter];
  //   } else if (secondaryUomFilter.length) {
  //     itemArray = [...secondaryUomFilter];
  //   }
  //   formGroup.controls.item_uom_list.setValue(itemArray);
  //   if (baseUomFilter.length) {
  //     uomControl.setValue(selectedItem.lower_unit_uom_id);
  //   } else {
  //     uomControl.setValue(secondaryUomFilter[0].id);
  //   }
  // }

  public postFinalInvoice(target: string): void {
    let salemanArray = this.salesmanFormControl.value;
    this.orderFormGroup.patchValue({
      salesman_id: salemanArray[0].id
    });
    const totalStats = {};
    Object.keys(this.orderFinalStats).forEach((key: string) => {
      totalStats[key] = this.orderFinalStats[key].value;
    });
    let customer_id = this.customerFormControl.value
      ? +this.customerFormControl.value.customer_infos_id
      : null;

    const finalPayload = {
      order_id: null,
      customer_id: customer_id,
      lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
      storage_location_id: this.warehouseFormControl.value[0] && this.warehouseFormControl.value[0].id || "",
      order_type_id: this.orderTypeFormControl.value,
      delivery_id: null,
      invoice_number: this.invoiceNumber ? this.invoiceNumber : '',
      ...this.orderFormGroup.value,
      ...totalStats,
      current_stage_comment: 'pending',
      source: 3,
      status: 1,
    };
    finalPayload['invoice_type'] = ConvertInvoiceType.DirectInvoice;

    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;

    this.finalOrderPayload = { ...finalPayload };

    this.finalOrderPayload.items.forEach((item) => {
      item['batch_number'] = null;
    });

    this.makeOrderPostCall(target);
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isDeliveryForm) {
      return formArray;
    }

    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        item_qty: new FormControl(1, [Validators.required]),
        item_uom_list: new FormControl([]),
        is_free: new FormControl(false)
      })
    );

    return formArray;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    // this.itemNameSubscriptions.push(
    //   // newFormGroup.controls['item'].valueChanges
    //   //   .pipe(
    //   //     distinctUntilChanged(
    //   //       (a, b) => JSON.stringify(a) === JSON.stringify(b)
    //   //     )
    //   //   )
    //   //   .pipe(
    //   //     startWith<string | Item>(''),
    //   //     map((value) => (typeof value === 'string' ? value : value.item_name)),
    //   //     map((value: string) => {
    //   //       return value;
    //   //     })
    //   //   ).subscribe((res) => {
    //   //     this.itemfilterValue = res || "";
    //   //     this.itempage = 1;
    //   //     this.itemlookup$.next(this.itempage)
    //   //   })
    // );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.valueChanges
        .pipe(
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        ).subscribe((result) => {
          const groupIndex = itemControls.controls.indexOf(newFormGroup);
          if (
            newFormGroup.controls['item'].value &&
            newFormGroup.controls['item_uom_id'].value
          ) {
            const body: any = {
              item_id: +result.item.id,
              item_uom_id: +result.item_uom_id,
              item_qty: result.item_qty,
              customer_id: this.isDepotOrder
                ? null
                : this.customerFormControl.value.id,
              lob_id: this.isDepotOrder
                ? ''
                : (this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || ""),
              depot_id: this.isDepotOrder ? this.depotFormControl.value : null,
            };
            console.log('change happen')
            if (!this.freeItems && !this.noFirstReqInEdit) {
              setTimeout(() => {
                this.getPromotion(result);
                if (body.item_qty > 0) {
                  if (!body.item_id) return;
                  this.subscriptions.push(
                    this.apiService.getOrderItemStats(body).subscribe(
                      (stats) => {
                        this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                          newFormGroup,
                          stats.data
                        );
                        this.generateOrderFinalStats(false, false);
                      },
                      (error) => {
                        this.commonToasterService.showError('Error in item');
                      }
                    )
                  );
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
              }, 500);
              this.isStockCheck(result);

            } else {
              setTimeout(() => {
                this.freeItems = false;
                this.noFirstReqInEdit = false;
              }, 1000);
            }
          } else {
            this.payloadItems[groupIndex] = this.setupPayloadItemArray(
              newFormGroup
            );
            this.generateOrderFinalStats(false, false);
          }
        })
    );
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
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

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();
    return this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }

  filterCustomers(customerName: string) {
    this.page = 1;
    this.filterValue = customerName.toLowerCase().trim() || "";
    this.filterCustomer = this.customers
      .filter(x => x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1 || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)
  }


  fiterItems(value) {
    this.itemfilterValue = value.toLowerCase().trim() || "";
    this.filteredItems = this.items
      .filter(x => x.item_code.toLowerCase().trim().indexOf(this.itemfilterValue) > -1 || x.item_name.toLowerCase().trim().indexOf(this.itemfilterValue) > -1)

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
    if (this.paymentTermFormControl.invalid) {
      Utils.setFocusOn('termFormField');
      return false;
    }
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

    this.orderFinalStats.total_gross.value =
      this.orderFinalStats.total_gross.value + +item.item_gross;
    this.orderFinalStats.total_vat.value =
      this.orderFinalStats.total_vat.value + +item.item_vat;
    this.orderFinalStats.total_excise.value =
      this.orderFinalStats.total_excise.value + +item.item_excise;
    this.orderFinalStats.total_net.value =
      this.orderFinalStats.total_net.value + +item.item_net;
    this.orderFinalStats.total_discount_amount.value =
      this.orderFinalStats.total_discount_amount.value +
      +item.item_discount_amount;
    this.orderFinalStats.grand_total.value =
      this.orderFinalStats.grand_total.value + +item.item_grand_total;
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: any
  ): OrderItemsPayload {
    console.log(form.value);
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_qty: form.controls.item_qty.value,
      item_uom_id: form.controls.item_uom_id.value,
      discount_id: result && result.discount_id ? result.discount_id : null,
      promotion_id: result && result.promotion_id ? result.promotion_id : null,
      is_free: form.controls.is_free.value || result?.is_free,
      is_item_poi: result?.is_item_poi || false,
      item_price: result && result.item_price ? Number(result.item_price) : 0,
      item_discount_amount:
        result && result.discount ? Number(result.discount) : 0,
      item_vat: result && result.total_vat ? Number(result.total_vat) : 0,
      item_net: result && result.total_net ? Number(result.total_net) : 0,
      total_net: result && result.net_gross ? Number(result.net_gross) - Number(result.discount) : 0,
      item_excise:
        result && result.net_excise ? Number(result.net_excise) : 0,
      total_excise:
        result && result.total_excise ? Number(result.total_excise) : 0,
      item_grand_total: result && result.total ? Number(result.total) : 0,
      item_gross: result && result.net_gross ? Number(result.net_gross) : 0,
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
      case OrderUpdateProcess.PartialInvoice:
        status = false;
        break;
      case OrderUpdateProcess.InProcess:
        status = false;
        break;
      case OrderUpdateProcess.Accept:
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

  private makeOrderPostCall(target: string): void {
    if (!this.checkFormValidation()) {
      return;
    }

    if (this.orderData && this.orderData.uuid) {
      this.subscriptions.push(
        this.invoiceServices
          .editInvoice(this.orderData.uuid, this.finalOrderPayload)
          .subscribe(
            (res: any) => {
              if (res.status) {
                this.commonToasterService.showSuccess(
                  '',
                  'Invoice updated sucessfully'
                );
                this.router.navigate(['transaction/invoice']);
              }
            },
            (error) => {
              this.commonToasterService.showError(
                'Failed!!!',
                'Error in generating invoice'
              );
            }
          )
      );
    } else {
      this.subscriptions.push(
        this.invoiceServices.saveInvoice(this.finalOrderPayload).subscribe(
          (res: any) => {
            if (res.status) {
              this.commonToasterService.showSuccess(
                '',
                'Invoice generated sucessfully'
              );
              this.router.navigate(['transaction/invoice']);
            }
          },
          (error) => {
            this.commonToasterService.showError(
              'Failed!!!',
              'Error in generating invoice'
            );
          }
        )
      );
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
          this.freeItems = true;
          if (added) return;
          element.name = element.item_name;
          element.item_price = element?.lower_unit_item_price;
          // element.discount = Number(element?.quantity || 0) * Number(element?.lower_unit_item_price);
          element.item_uom_id = element.selected_item_uom;
          element.item_qty = Number(element?.quantity || 0);
          element['is_free'] = false;
          this.addBulkItemForm(element);
          let item = { id: element.id, name: element.name };
          this.setItemBulk(element, itemControls.value.length - 1);
          const newFormGroup = itemControls.controls[itemControls.value.length - 1] as FormGroup;
          this.payloadItems[itemControls.value.length - 1] = this.setupPayloadItemArray(
            newFormGroup,
            element
          );
        });
      }
    });
  }
  public addBulkItemForm(item?: any): void {
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

  public setItemBulk(data: any, index: number): void {


    this.itemfilterValue = '';
    let selectedItem = data;
    selectedItem['lower_unit_uom_id'] = data?.item_uom_lower_unit?.id || 0;
    selectedItem['item_main_price'] = data?.item_main_price || [];
    const itemFormGroup = this.itemFormControls[index] as FormGroup;

    this.setUpRelatedUomBulk(selectedItem, itemFormGroup);
  }

  setUpRelatedUomBulk(selectedItem: any, formGroup: FormGroup) {
    console.log(selectedItem);
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem?.lower_unit_uom_id)
    );
    let secondaryUomFilter = [];
    if (selectedItem?.item_uom_list && selectedItem?.item_uom_list?.length) {


      formGroup.controls.item_uom_list.setValue(selectedItem?.item_uom_list);
      if (selectedItem?.selected_item_uom) {
        uomControl.setValue(selectedItem?.selected_item_uom);
      } else {
        if (baseUomFilter.length) {
          uomControl.setValue(selectedItem?.lower_unit_uom_id);
        } else {
          uomControl.setValue(secondaryUomFilter[0]?.id);
        }
      }

    }
  }


  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
  getStorageLocationName(data) {
    if (data.name) {
      return data.code + ' - ' + data.name;
    } else {
      return 'Select Option';
    }
  }
  openWarehouse() {
    this.showWareHs = true;
  }

}

const ORDER_TYPES: any | OrderType[] = [
  { id: 0, name: 'Cash' },
  { id: 1, name: 'Credit' },
  { id: 2, name: 'TC' },
  { id: 3, name: 'Export' },
  { id: 4, name: 'Depot' },
];

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
  // { id: 12, key: 'weight', label: 'Weight', show: true },
  // { id: 13, key: 'ohq', label: 'On Hand Qty', show: true },
];
