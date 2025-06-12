import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { BranchDepotMaster } from 'src/app/components/main/settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderItemsPayload,
  OrderType,
  ApiItemPriceStats,
} from 'src/app/components/main/transaction/orders/order-models';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CreditNoteService } from '../credit-note.service';
import { CreditNoteItemsComponent } from '../credit-note-items/credit-note-items.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MasterService } from '../../../master/master.service';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import { OrderService } from '../../orders/order.service';
import { BulkItemModalComponent } from '../../bulk-item-modal/bulk-item-modal.component';
import { endpoints } from 'src/app/api-list/api-end-points';
@Component({
  selector: 'app-credit-note-form',
  templateUrl: './credit-note-form.component.html',
  styleUrls: ['./credit-note-form.component.scss'],
})
export class CreditNoteFormComponent implements OnInit, OnDestroy {
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  public pageTitle: string;
  public isEditForm: boolean;
  public currentDate: any;
  public uuid: string;
  public isDepotOrder: boolean;
  public creditNoteData: any;
  public objectValues = Object.values;
  public invoices: any[] = [];
  public finalOrderPayload: any;
  public currencyCode = getCurrency();
  public selected_invoice: any = {
    invoice_number: "",
    grand_total: ""
  };
  storageLocationList: any[] = [];
  showWareHs = false;
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public creditNoteStats: {
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
      total_discount_amount: { label: 'Discount', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      grand_total: { label: 'Invoice Total', value: 0 },
    };

  public creditNoteForm: FormGroup;
  // public orderTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public numberFormControl: FormControl;
  public reasonFormControl: FormControl;
  public invoiceFormControl: FormControl;
  public creditNoteTypeFormControl: FormControl;
  public creditNoteDateFormControl: FormControl;
  public warehouseFormControl: FormControl;
  public customerGRVNoFormControl: FormControl;
  public customerGRVAmountFormControl: FormControl;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  ohqData: any = [];
  storeId = '';
  showLob = false;
  isCustomerlobShow: boolean = false;

  // public orderTypes: OrderType[] = [];
  public items: Item[] = [];
  invoiceItems: any[] = [];
  creditLimit;
  public filteredItems: Item[] = [];
  keyUp = new Subject<string>();

  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public returnReasons: { id: number; name: string }[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedReasonId: number;
  public selectedPaymentTermId: number;
  public is_lob: boolean = false;

  public filterCustomer: Customer[] = [];
  isLoading: boolean;
  filterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  public salesmanFormControl: FormControl;
  itemfilterValue = '';
  customerLobList = [];

  private router: Router;
  private creditNoteService: CreditNoteService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private finalDeliveryPayload: any = {};
  private toaster: CommonToasterService;
  nextCommingNumberPrefix: any;
  public salesmen: SalesMan[] = [];
  isCreditTypeIsInvoice: boolean;

  constructor(
    creditNoteService: CreditNoteService,
    public apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    toaster: CommonToasterService,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    private masterService: MasterService,
    private orderService: OrderService
  ) {
    Object.assign(this, {
      creditNoteService,
      dataService,
      dialogRef,
      elemRef,
      toaster,
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

    this.currentDate = today.getFullYear() + '-' + month + '-' + date;
    this.getrouteitemgroupCode();
    this.setTableHeaders();

    // this.orderTypeFormControl = new FormControl(this.selectedOrderTypeId, [ Validators.required ]);
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
    this.reasonFormControl = new FormControl(this.selectedReasonId, [
      Validators.required,
    ]);
    this.invoiceFormControl = new FormControl('', [Validators.required]);
    // this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId, [ Validators.required ]);
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl('', [Validators.required]);
    this.warehouseFormControl = new FormControl('');
    this.customerGRVNoFormControl = new FormControl('');
    this.customerGRVAmountFormControl = new FormControl('');
    this.numberFormControl = new FormControl('', [Validators.required]);
    // this.noteFormControl = new FormControl('', [ Validators.required ]);
    // this.dueDateFormControl = new FormControl('', [ Validators.required ]);
    this.creditNoteDateFormControl = new FormControl(this.currentDate, [Validators.required]);
    this.creditNoteTypeFormControl = new FormControl('1');
    this.reasonFormControl = new FormControl('0');
    this.isCreditTypeIsInvoice = false;
    this.salesmanFormControl = new FormControl('', [Validators.required])

    this.creditNoteForm = this.formBuilder.group({
      // 'order_type_id': this.orderTypeFormControl,
      // 'payment_term_id': this.paymentTermFormControl,
      depot_id: this.depotFormControl,
      credit_note_number: this.creditNoteDateFormControl,
      invoice_id: this.invoiceFormControl,
      salesman_id: this.salesmanFormControl,
      // 'any_comment': this.noteFormControl,
      // 'due_date': this.dueDateFormControl,
      credit_note_date: this.creditNoteDateFormControl,
      items: this.initItemFormArray(),
    });
    // this.addItemForm();
    // this.getItemsList();
    this.subscriptions.push(
      this.masterService.itemDetailDDllistTable({}).subscribe((result) => {
        // this.itempage++;
        this.items = result.data;
        this.filteredItems = result.data;
        // this.item_total_pages = result.pagination?.total_pages
      })
    );
    this.subscriptions.push(
      this.masterService.customerDetailDDlListTable({}).subscribe((result) => {
        // this.page++;
        this.customers = result.data;
        this.filterCustomer = result.data.slice(0, 30);
        console.log(this.filterCustomer);
        // this.total_pages = result.pagination?.total_pages
      })
    );
    //this.customers = this.route.snapshot.data['resolved'].customers.data;
    //this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;

    this.isEditForm = this.router.url.includes('credit-note/edit/');

    if (this.isEditForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Credit Note';
      this.creditNoteData = this.route.snapshot.data['resolved'].editData.data;
      this.setupEditFormControls(this.creditNoteData);
      this.numberFormControl.setValue(this.creditNoteData.credit_note_number);

    } else {
      this.pageTitle = 'Add Credit Note';
      this.addItemFilterToControl(0);
    }

    // this.subscriptions.push(
    //   this.customerFormControl.valueChanges
    //     .pipe(
    //       startWith<string | Customer>(''),
    //       map((value) =>
    //         typeof value === 'string'
    //           ? value
    //           : `${value.user.firstname} ${value.user.lastname}`
    //       ),
    //       map((value: string) => {
    //         return value.length
    //           ? this.filterCustomers(value)
    //           : this.customers.slice();
    //       })
    //     )
    //     .subscribe((value) => {
    //       this.filteredCustomers = value;
    //     })
    // );

    // this.subscriptions.push(
    //   this.creditNoteService.getAllDepots().subscribe((result) => {
    //     this.depots = result.data;
    //   })
    // );
    // this.subscriptions.push(
    //   this.apiService.getSalesMan().subscribe((result) => {
    //     this.salesmen = result.data;
    //   })
    // );

    // this.subscriptions.push(
    //   this.creditNoteService.getReturnReasons().subscribe((result) => {
    //     this.returnReasons = result.data;
    //   })
    // );
    this.subscriptions.push(
      this.creditNoteService.getReturnReasonsType().subscribe((result) => {
        this.returnReasons = result.data.filter(x => x.type == "Bad Return Reason" || x.type == "Good Return Reason");
      })
    );

    this.subscriptions.push(
      this.apiService.getCreditLimits().subscribe((result) => {
        this.creditLimit = result.data;
      })
    );

    // this.lookup$
    //   .pipe(exhaustMap(() => {
    //     return this.masterService.customerDetailListTable({ name: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
    //   }))
    //   .subscribe(res => {
    //     this.isLoading = false;
    //     if (this.filterValue == "") {
    //       if (this.page > 1) {
    //         this.customers = [...this.customers, ...res.data];
    //         this.filterCustomer = [...this.filterCustomer, ...res.data];
    //       } else {
    //         this.customers = res.data;
    //         this.filterCustomer = res.data;
    //       }
    //       this.page++;
    //       this.total_pages = res?.pagination?.total_pages;
    //     } else {
    //       this.page = 1;
    //       this.customers = res.data;
    //       this.filterCustomer = res.data;
    //     }
    //   });

    // this.itemlookup$
    //   .pipe(exhaustMap(() => {
    //     return this.masterService.itemDetailListTable({ item_name: this.itemfilterValue.toLowerCase(), page: this.itempage, page_size: this.page_size })
    //   }))
    //   .subscribe(res => {
    //     this.isLoading = false;
    //     if (this.itemfilterValue == "") {
    //       if (this.itempage > 1) {
    //         this.items = [...this.items, ...res.data];

    //         this.filteredItems = [...this.filteredItems, ...res.data];
    //       } else {
    //         this.items = res.data;
    //         this.filteredItems = res.data;
    //       }
    //       this.itempage++;
    //       this.item_total_pages = res?.pagination?.total_pages;
    //     } else {
    //       this.itempage = 1;
    //       this.items = res.data;
    //       this.filteredItems = res.data;
    //     }
    //   });
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
          // var paymentTermId = this.customerLobList.find(x => x.lob_id == res[0].id)?.payment_term_id;
          let findCustomerLOBByWarehouse = this.customerLobList.find(i => i.lob_id == res[0].id);
          // if (!this.isEditForm) {
          //   if (findCustomerLOBByWarehouse.customer_type) {
          //     const findType = this.orderTypes.find(i => i.name.toLowerCase() === findCustomerLOBByWarehouse.customer_type.customer_type_name.toLowerCase());
          //     this.orderTypeFormControl.patchValue(findType.id);
          //   }
          // }
          this.apiService.getWarehouse(res[0].id).subscribe(x => {
            this.storageLocationList = x.data;
            if (this.creditNoteData?.storage_location_id) {
              // var storageArray = this.storageLocationList.find(sl => sl.id == this.creditNoteData.storage_location_id || sl.id == findCustomerLOBByWarehouse.customer_warehouse_mapping.storageocation.id);
              // if (storageArray) {
              let obj = { id: this.creditNoteData.storageocation.id, itemName: this.creditNoteData.storageocation.code + ' - ' + this.creditNoteData.storageocation.name };
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
          // this.paymentTermFormControl.patchValue(paymentTermId);
          // this.selectedPaymentTermId = paymentTermId;
          // this.payTermChanged(paymentTermId);
        }
      }
      // this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);

    });

    this.invoiceFormControl.valueChanges.subscribe((value) => {
      if (this.isEditForm) {
        this.isEditForm = false;
        return;
      }
      this.openItemDialog();
    });

    this.creditNoteTypeFormControl.valueChanges.subscribe((value) => {
      this.isCreditTypeIsInvoice = true;
      if (value == '1') {
        this.isCreditTypeIsInvoice = false;
      }
    });

    this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(100),
      )),
    ).subscribe(res => {
      console.log("res", res)
      if (!res) {
        res = '';
      }
      this.filterCustomers(res);
    });
  }
  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm) {
      return formArray;
    }

    // formArray.push(
    //   this.formBuilder.group({
    //     item: new FormControl('', [Validators.required]),
    //     item_name: new FormControl('', [Validators.required]),
    //     item_uom_list: new FormControl([]),
    //     item_uom_id: new FormControl(undefined, [Validators.required]),
    //     reason: new FormControl(this.reasonFormControl.value, [Validators.required]),
    //     item_qty: new FormControl(1, [Validators.required]),
    //     item_expiry_date: new FormControl(1, [Validators.required]),
    //     item_condition: new FormControl(1),
    //     item_price: new FormControl(0),
    //     item_discount_amount: new FormControl(0),
    //     item_vat: new FormControl(0),
    //     item_net: new FormControl(0),
    //     item_excise: new FormControl(0),
    //     item_grand_total: new FormControl(0),
    //     invoice_number: new FormControl(''),
    //     invoice_total: new FormControl(0),
    //   })
    // );

    // return formArray;
    const group = this.createItemFormGroup(null);
    formArray.push(group);
    return formArray;
  }
  createItemFormGroup(item, isBulk = false) {
    let group;
    if (item && isBulk) {
      group = new FormGroup({
        item: new FormControl({ id: item.id, name: item.name, code: item.item_code }, [
          Validators.required,
        ]),
        item_name: new FormControl(item.name, [
          Validators.required,
        ]),
        item_uom_id: new FormControl(+item.selected_item_uom, [Validators.required]),
        item_qty: new FormControl(item?.item_qty, [Validators.required]),
        reason: new FormControl(item.reason, [Validators.required]),
        item_expiry_date: new FormControl(item.item_expiry_date, [Validators.required]),
        item_condition: new FormControl(1),
        item_price: new FormControl(+item?.item_price),
        item_discount_amount: new FormControl(item?.item_discount_amount),
        item_vat: new FormControl(item?.item_vat),
        item_net: new FormControl(item?.item_net),
        item_excise: new FormControl(item?.item_excise),
        item_grand_total: new FormControl(item?.item_grand_total),
        item_uom_list: new FormControl([]),
        invoice_number: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.invoice_number : item.invoice?.invoice_number),
        invoice_total: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.grand_total : item.invoice?.grand_total),
      });

    }
    else if (item && !isBulk) {
      group = new FormGroup({
        item: new FormControl(
          { id: item?.item.id, code: item?.item.item_code, name: item?.item.item_name },
          [Validators.required]
        ),
        item_name: new FormControl(item?.item.item_name,
          [Validators.required]
        ),
        item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
        reason: new FormControl(item.reason, [Validators.required]),
        invoice_number: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.invoice_number : item.invoice?.invoice_number),
        invoice_total: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.grand_total : item.invoice?.grand_total),
        item_qty: new FormControl(item.item_qty, [Validators.required, Validators.maxLength(item.item_qty)]),
        item_expiry_date: new FormControl(item.item_expiry_date, [Validators.required]),
        item_condition: new FormControl(1),
        item_price: new FormControl(item.item_price),
        item_discount_amount: new FormControl(item.item_discount_amount),
        item_vat: new FormControl(item.item_vat),
        item_net: new FormControl(item.item_net),
        item_excise: new FormControl(item.item_excise),
        item_grand_total: new FormControl(item.item_grand_total),
        item_uom_list: new FormControl([]),
      });
    } else {
      group = new FormGroup({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_list: new FormControl([]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        reason: new FormControl(this.reasonFormControl.value, [Validators.required]),
        item_qty: new FormControl(1, [Validators.required]),
        item_expiry_date: new FormControl(1, [Validators.required]),
        item_condition: new FormControl(1),
        item_price: new FormControl(0),
        item_discount_amount: new FormControl(0),
        item_vat: new FormControl(0),
        item_net: new FormControl(0),
        item_excise: new FormControl(0),
        item_grand_total: new FormControl(0),
        invoice_number: new FormControl(''),
        invoice_total: new FormControl(0),
      });
    }

    // group.valueChanges.pipe(first()).subscribe((response) => {
    //   this.getPromotion(response);
    // });

    return group;
  }
  getOnHoldQty() {
    const itemControls = this.creditNoteForm.controls['items'] as FormArray;
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

  openItemDialog() {
    if (this.isCreditTypeIsInvoice) {
      const invoice = this.invoices.find((item) => item.id == this.invoiceFormControl.value);
      if (!invoice) return;
      this.creditNoteService.getinvoiceitem(invoice.id).subscribe((resp) => {
        this.dialogRef
          .open(CreditNoteItemsComponent, {
            width: '500px',
            data: resp.data, // invoice['invoices'],
          })
          .afterClosed()
          .subscribe((data) => {
            if (data && data.length < 1) {
              return;
            }

            const itemControls = this.creditNoteForm.controls['items'] as FormArray;
            for (let item of data) {
              var itemgroups = itemControls.value.filter(x => x.item.id == item.item.id && x.item_qty == item.item_qty);
              item.isInserted = false;
              if (itemgroups.length == Number(item.item_qty) || itemgroups.length > 0) {
                item.isInserted = true;
              }
            }
            Array.from(data).forEach((item: any) => {
              if (!item.isInserted) {
                this.addItemForm(item);
              } else {
                this.toaster.showInfo(
                  'Alert',
                  'Item with same Quantity already Exist in list.'
                );
              }
            });
          });
      })
    } else {
      this.addItemForm(null)
    }
  }

  openBulkItemSelectionPopup() {
    this.dialogRef.open(BulkItemModalComponent, {
      width: '1000px',
      data: { title: `Are you sure want to delete this Salesman ?` }
    }).afterClosed().subscribe(data => {
      if (data.length > 0) {
        const itemControls = this.creditNoteForm.controls['items'] as FormArray;
        // for (let item of data) {
        //   var itemgroups = itemControls.value.filter(x => x.item.id == item.id && x.item_qty == item.item_qty);
        //   item.isInserted = false;
        //   if (itemgroups.length == Number(item.item_qty) || itemgroups.length > 0) {
        //     item.isInserted = true;
        //   }
        // }
        // Array.from(data).forEach((item: any) => {
        //   if (!item.isInserted) {
        //     this.addItemForm(item, true);
        //   } else {
        //     this.toaster.showInfo(
        //       'Alert',
        //       'Item with same Quantity already Exist in list.'
        //     );
        //   }
        // });
        data.forEach(element => {
          const added = itemControls.value.find(
            (it: any) => it.item.id == element.id && it.item_qty == element.item_qty
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
    const itemControls = this.creditNoteForm.controls['items'] as FormArray;
    itemControls.value.forEach((element, index) => {
      if (!element.item) {
        const d1 = this.creditNoteForm.get('items') as FormArray;
        this.payloadItems.splice(index, 1);
        itemControls.removeAt(index);
      }
    });
    let group = this.createItemFormGroup(item, true);
    itemControls.push(group);
    this.addItemFilterToControl(itemControls.controls.length - 1);
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
  getSelectedInvoiceData(invoiceId) {
    this.selected_invoice = this.invoices.find((x) => x.id === invoiceId);
  }
  filterCustomers(customerName: string) {

    this.page = 1;
    this.filterValue = customerName.toLowerCase().trim() || "";
    // this.customers = [];
    this.filterCustomer = this.customers
      .filter(x => x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1 || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)

    // this.page = 1;
    // this.filterValue = customerName.toLowerCase() || "";
    // this.customers = [];
    // this.filterCustomer = [];
    // this.isLoading = true
    // this.lookup$.next(this.page)
  }
  public customerSelected(customer, editData?): void {
    // this.filterValue = "";
    // this.lookup$.next(this.page)
    this.getCustomerLobList(customer, editData);
    // this.getPendingInvoices();
  }
  getCustomerLobList(customer, editData?) {
    if (customer?.is_lob == 1 || editData?.lob) {
      this.is_lob = true;
      this.customerLobFormControl.setValidators([Validators.required]);
      this.customerLobFormControl.updateValueAndValidity();
      if (editData && editData?.lob_id) {
        let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
        this.customerLobFormControl.setValue(customerLob);
      }

      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          setTimeout(() => {
            if (editData && editData?.lob_id) {
              let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
              this.customerLobFormControl.setValue(customerLob);
            } else {
              this.showLob = true;
              this.showWareHs = true;
              this.customerLobFormControl.setValue([]);
              this.warehouseFormControl.setValue([]);
            }
          }, 1000);
        }
      })
    }
    else {
      this.is_lob = false;
      this.customerLobFormControl.clearValidators();
      this.customerLobFormControl.updateValueAndValidity();
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
  onScroll() {
    var totalPages = this.customers.length / 30;
    if (this.filterCustomer.length == this.customers.length) return;
    this.page = this.page + 30;
    var pageEndNumber = 30 + this.page;
    this.filterCustomer = [...this.filterCustomer, ...this.customers.slice(this.page, pageEndNumber)]
  }

  onScrollItem() {
    // if (this.item_total_pages <= this.itempage) return;
    // this.isLoading = true;
    // this.itemlookup$.next(this.itempage);
  }

  goBackToCreditList(){
    this.router.navigate(['transaction/creditnote']);
  } 
  
  customerLobSelected() {
    // this.getPendingInvoices();
  }

  getPendingInvoices() {
    let body = {
      customer_id: this.customerFormControl.value.user_id
    }
    this.creditNoteService.getcustomerinvoice(body).subscribe(
      (response) => {
        this.resetStats();
        const itemControls = this.creditNoteForm.controls['items'] as FormArray;
        itemControls.clear();
        this.invoices = response.data;
        if (this.isEditForm) {
          this.getSelectedInvoiceData(this.creditNoteData.invoice_id)
          this.creditNoteData.credit_note_details.forEach(
            (item, index: number) => {

              this.addItemForm(item);

              const itemStats = this.payloadItems[index];
              Object.keys(this.payloadItems[index]).forEach((key) => {
                if (key == 'invoice_number' && !item['invoice_number'] || key == 'invoice_total' && !item['invoice_total']) {
                  return;
                }
                itemStats[key] = item[key];

              });
            }
          );
          this.invoiceFormControl.patchValue(this.creditNoteData.invoice.id);
          Object.keys(this.creditNoteStats).forEach((key) => {
            this.creditNoteStats[key].value = this.creditNoteData[key];
          });
        }
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  public setTableHeaders(): void {
    this.itemTableHeaders = [...ITEM_ADD_FORM_TABLE_HEADS1];
    // this.itemTableHeaders.splice(3, 0, {
    //   id: 4,
    //   key: 'reason',
    //   label: 'Reason',
    // });
    // this.itemTableHeaders.splice(4, 0, {
    //   id: 5,
    //   key: 'invoiceNumber',
    //   label: 'Invoice Number',
    // });
    // this.itemTableHeaders.splice(5, 0, {
    //   id: 6,
    //   key: 'invoiceAmount',
    //   label: 'Invoice Amount',
    // });
    // this.itemTableHeaders.splice(5, 0, {
    //   id: 7,
    //   key: 'item_expiry_date',
    //   label: 'Expiry Date',
    // });
    this.itemTableHeaders.forEach((head, index) => {
      this.itemTableHeaders[index].id = index;
    });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }
  openLOB() {
    this.showLob = true;
  }
  public openNumberSettings(): void {
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: {
          title: 'Credit Note Code',
          functionFor: 'credit_note ',
          code: this.numberFormControl.value,
          prefix: this.nextCommingNumberPrefix,
        },
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.numberFormControl.setValue('');
          this.numberFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.numberFormControl.setValue(
            res.data.next_coming_number_bank_information
          );
          this.nextCommingNumberPrefix = res.reqData.prefix_code;
          this.numberFormControl.disable();
        }
      });
  }

  public setupEditFormControls(editData: any): void {
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
    const customer =
      this.customers &&
      this.customers.find((cust) => cust.user_id === editData.customer.id);
    this.filteredCustomers.push(customer);

    editData.customerObj = { id: editData.customer?.customerinfo?.user_id, user: editData.customer, user_id: editData.customer?.customerinfo?.user_id };
    editData.customer = editData.customer
      ? {
        customer_id: editData.customer.customer_id,
        user_id: editData.customer?.customerinfo?.id,
        customer_name: editData.customer
          ? editData.customer.firstname + ' ' + editData.customer.lastname
          : 'Unknown',
      }
      : undefined;

    if (editData.customerObj?.user) {
      if (editData.customerObj?.user?.customerinfo) {
        editData.customerObj['customer_infos_id'] = editData.customerObj?.user?.customerinfo.id
      }
    }
    this.customerFormControl.setValue(editData.customerObj);
    // this.getCustomerLobList(editData);
    // let customerLob = [{ id: editData.lob_id, itemName: editData.lob?.lob_name }]
    // this.customerLobFormControl.setValue(customerLob);

    this.creditNoteDateFormControl.setValue(editData.credit_note_date);
    this.numberFormControl.setValue(editData.credit_note_number);
    if (!editData.invoice && !editData.invoice_id) {
      this.creditNoteTypeFormControl = new FormControl('1');
      this.isCreditTypeIsInvoice = false;
    }

    setTimeout(() => {
      // this.invoiceFormControl.setValue(editData?.invoice_id);
      this.reasonFormControl.setValue(editData.reason);
    }, 1000);
    this.customerSelected(editData.customerObj, editData);

  }

  public addItemForm(item?: any, isbulkitem?): void {
    const itemControls = this.creditNoteForm.controls['items'] as FormArray;
    var selectedItem = item;
    // itemControls.controls.length = 0;
    if (item) {
      if (isbulkitem) {
        selectedItem = item;

        itemControls.push(
          this.formBuilder.group({
            item: new FormControl(
              { id: item?.id, code: item?.item_code, name: item?.item_name },
              [Validators.required]
            ),
            item_name: new FormControl(item?.item_name,
              [Validators.required]
            ),
            item_uom_id: new FormControl(item.lower_unit_uom_id, [Validators.required]),
            reason: new FormControl(item.reason, [Validators.required]),
            item_qty: new FormControl(1, [Validators.required]),
            item_expiry_date: new FormControl(item.item_expiry_date, [Validators.required]),
            item_condition: new FormControl(1),
            item_price: new FormControl(item.item_price),
            item_discount_amount: new FormControl(item.item_discount_amount),
            item_vat: new FormControl(item.item_vat),
            item_net: new FormControl(item.item_net),
            item_excise: new FormControl(item.item_excise),
            item_grand_total: new FormControl(item.item_grand_total),
            item_uom_list: new FormControl([]),
            invoice_number: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.invoice_number : item.invoice?.invoice_number),
            invoice_total: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.grand_total : item.invoice?.grand_total),

          })
        );

      } else {
        selectedItem = item?.item;

        itemControls.push(
          this.formBuilder.group({
            item: new FormControl(
              { id: item?.item.id, code: item?.item.item_code, name: item?.item.item_name },
              [Validators.required]
            ),
            item_name: new FormControl(item?.item.item_name,
              [Validators.required]
            ),
            item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
            reason: new FormControl(item.reason, [Validators.required]),
            invoice_number: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.invoice_number : item.invoice?.invoice_number),
            invoice_total: new FormControl(this.creditNoteData ? this.creditNoteData.invoice?.grand_total : item.invoice?.grand_total),
            item_qty: new FormControl(item.item_qty, [Validators.required, Validators.maxLength(item.item_qty)]),
            item_expiry_date: new FormControl(item.item_expiry_date, [Validators.required]),
            item_condition: new FormControl(1),
            item_price: new FormControl(item.item_price),
            item_discount_amount: new FormControl(item.item_discount_amount),
            item_vat: new FormControl(item.item_vat),
            item_net: new FormControl(item.item_net),
            item_excise: new FormControl(item.item_excise),
            item_grand_total: new FormControl(item.item_grand_total),
            item_uom_list: new FormControl([]),

          })
        );
      }
      var formgroup = itemControls.controls[itemControls.controls.length - 1];
      this.addItemFilterToControl(itemControls.controls.length - 1);

      this.setUpRelatedUomForInvoiceItem(selectedItem, formgroup)
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_name: new FormControl('', [Validators.required]),
          item_uom_list: new FormControl([]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          reason: new FormControl(this.reasonFormControl.value, [Validators.required]),
          item_qty: new FormControl(1, [Validators.required]),
          item_expiry_date: new FormControl(1, [Validators.required]),
          item_condition: new FormControl(1),
          item_price: new FormControl(0),
          item_discount_amount: new FormControl(0),
          item_vat: new FormControl(0),
          item_net: new FormControl(0),
          item_excise: new FormControl(0),
          item_grand_total: new FormControl(0),
          invoice_number: new FormControl(''),
          invoice_total: new FormControl(0),
        })
      );
      this.addItemFilterToControl(itemControls.controls.length - 1);

    }

  }

  public reasonChanged(id: number): void {
    this.selectedReasonId = id;
    this.reasonFormControl.setValue(id);
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
  public goToAllNotes(): void {
    this.router.navigate(['transaction/credit-note']);
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

    this.generatecreditNoteStats(false, true);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.creditNoteForm.get('items') as FormArray;

    return itemControls.controls;
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

  public customerControlDisplayValue(customer: Customer): string {
    if (customer?.user) {
      return `${customer.user.firstname} ${customer.user.lastname}`
    } else
      return `${customer?.customer_code ? customer?.customer_code : ''} ${customer?.name ? customer?.name : ''} `
    // return customer
    //   ? `${customer.user.firstname} ${customer.user.lastname}`
    //   : '';
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.creditNoteForm.get('items') as FormArray;
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
    this.generatecreditNoteStats(true, isSelectedItemDelete);
  }

  getItemDetailByName(name) {
    return this.masterService
      .itemDetailListTable({ item_name: name.toLowerCase(), })
  }

  public itemDidSearched(data: any, index: number): void {
    this.getItemDetailByName(data.name).subscribe(res => {
      var _items = res.data;
      const selectedItem: any = _items.find((res: any) => res.id === data.id);
      // const selectedItem = this.items.find((item: Item) => item.id === data.id);
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      const itemnameControl = itemFormGroup.controls.item_name;
      itemnameControl.setValue(data.name);
      const uomControl = itemFormGroup.controls.item_uom_id;
      uomControl.setValue(selectedItem.lower_unit_uom_id);
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    });
  }

  setUpRelatedUom(selectedItem: any, formGroup: FormGroup) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem.lower_unit_uom_id)
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
    if (baseUomFilter.length) {
      uomControl.setValue(selectedItem.lower_unit_uom_id);
    } else {
      uomControl.setValue(secondaryUomFilter[0].id);
    }
  }

  setUpRelatedUomForInvoiceItem(selectedItem: any, formGroup: any) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(uomControl.value) || item.id == parseInt(selectedItem.lower_unit_uom_id)
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

    var filterUom = [];
    itemArray.forEach(element => {
      if (!filterUom.find(x => x.id == element.id)) {
        filterUom.push(element);
      }
    });

    formGroup.controls.item_uom_list.setValue(filterUom);
    if (!uomControl.value) {
      if (baseUomFilter.length) {
        uomControl.setValue(selectedItem.lower_unit_uom_id);
      } else {
        uomControl.setValue(secondaryUomFilter[0].id);
      }
    }
  }

  public postFinalPayload(): void {
    const totalStats = {};
    Object.keys(this.creditNoteStats).forEach((key: string) => {
      totalStats[key] = this.creditNoteStats[key].value;
    });
    const finalPayload = {
      customer_id: this.customerFormControl.value.id,
      lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
      storage_location_id: this.warehouseFormControl.value[0] && this.warehouseFormControl.value[0].id || "",
      ...this.creditNoteForm.value,
      ...totalStats,
      credit_note_number: this.numberFormControl.value,
      credit_note_date: this.creditNoteDateFormControl.value,
      source: 3,
      reason: this.reasonFormControl.value,
      customer_reference_number: this.customerGRVNoFormControl.value,
      customer_amount: this.customerGRVAmountFormControl.value
    };

    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;
    if (this.salesmanFormControl.value.length > 0) {
      finalPayload['salesman_id'] = this.salesmanFormControl.value[0].id;
    }
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

    this.makeOrderPostCall();
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.creditNoteForm.controls['items'] as FormArray;
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
    //       this.isLoading = true;
    //       this.itemlookup$.next(this.itempage)
    //     })
    // );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.valueChanges.subscribe((result) => {
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        this.payloadItems[groupIndex] = this.setupPayloadItemArray(
          newFormGroup
        );
        if (
          newFormGroup.controls['item'].value &&
          newFormGroup.controls['item_uom_id'].value && result.item.id
        ) {
          const body: any = {
            item_id: result.item.id,
            item_uom_id: result.item_uom_id,
            item_qty: result.item_qty,
            lob_id: this.customerLobFormControl.value ? this.customerLobFormControl.value[0].id : '',
            customer_id: this.customerFormControl.value ? this.customerFormControl.value.customer_infos_id : '',
          };
          var _this = this;
          this.subscriptions.push(
            this.orderService.getOrderItemStats(body)
              .subscribe((stats) => {
                if (stats.data) {
                  if (stats.data.length == 0) {
                    _this.toaster.showInfo(
                      'Alert',
                      'Could not find data on selected parameter.'
                    );
                    return;
                  }
                }
                let newdata = stats.data;
                _this.payloadItems[groupIndex] = _this.setupPayloadItemArray(
                  newFormGroup,
                  stats.data
                );

                _this.generatecreditNoteStats(false, false);
              })
          );
        } else {
          this.payloadItems[groupIndex] = this.setupPayloadItemArray(
            newFormGroup
          );
          this.generatecreditNoteStats(false, false);
        }
      })
    );
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  filterItems(value: string) {
    // this.itemfilterValue = itemName.toLowerCase().trim() || "";
    // this.filteredItems = this.items
    //   .filter(x => x.item_code.toLowerCase().trim().includes(this.itemfilterValue) || x.item_name.toLowerCase().trim().includes(this.itemfilterValue))

    this.isLoading = true;
    if (value !== '') {
      this.itemfilterValue = value.toLowerCase().trim() || "";
      // this.filteredItems = this.items
      //   .filter(x => x.item_code.toLowerCase().trim().indexOf(this.itemfilterValue) > -1 || x.item_name.toLowerCase().trim().indexOf(this.itemfilterValue) > -1)
      this.filteredItems = this.items.filter(x => x.item_code.toLowerCase().trim() === this.itemfilterValue || x.item_name.toLowerCase().trim() === this.itemfilterValue);
      if (this.filteredItems.length == 1) {
        this.isLoading = false;
      }
    } else {
      this.filteredItems = this.items;
    }
  }

  // private filterCustomers(customerName: string): Customer[] {
  //   const filterValue = customerName.toLowerCase();

  //   return this.customers.filter(
  //     (customer) =>
  //       customer.user.firstname.toLowerCase().includes(filterValue) ||
  //       customer.user.lastname.toLowerCase().includes(filterValue)
  //   );
  // }

  public checkFormValidation(): boolean {
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
    if (this.reasonFormControl.invalid) {
      Utils.setFocusOn('reasonFormField');
      return false;
    }
    if (this.numberFormControl.invalid) {
      Utils.setFocusOn('numberField');
      return false;
    }
    return true;
  }

  private generatecreditNoteStats(
    isDeleted?: boolean,
    isItemSelection?: boolean
  ): void {
    Object.values(this.creditNoteStats).forEach((item) => {
      item.value = 0;
    });
    this.payloadItems.forEach((item: OrderItemsPayload) => {
      this.sumUpFinalStats(item, false);
    });
  }
  getrouteitemgroupCode() {
    const nextNumber = {
      function_for: 'credit_note ',
    };
    this.creditNoteService
      .getNextCommingCode(nextNumber)
      .subscribe((res: any) => {
        if (res.status) {
          const data = res.data.number_is;
          this.nextCommingNumberPrefix = res.data.prefix_is;
          if (data) {
            this.numberFormControl.setValue(data);
            this.numberFormControl.disable();
          } else if (data == null) {
            this.numberFormControl.enable();
          }
        } else {
          this.numberFormControl.enable();
        }
      });
  }
  private sumUpFinalStats(
    item: OrderItemsPayload,
    isForDelivery?: boolean
  ): void {
    // this.creditNoteStats.total_gross.value =
    //   this.creditNoteStats.total_gross.value + Number(item.item_gross);
    // this.creditNoteStats.total_vat.value =
    //   this.creditNoteStats.total_vat.value + Number(item.item_vat);
    // this.creditNoteStats.total_excise.value =
    //   this.creditNoteStats.total_excise.value + Number(item.total_excise);
    // this.creditNoteStats.total_net.value =
    //   this.creditNoteStats.total_net.value + Number(item.total_net);
    // this.creditNoteStats.total_discount_amount.value =
    //   this.creditNoteStats.total_discount_amount.value +
    //   Number(item.item_discount_amount);
    // this.creditNoteStats.grand_total.value =
    //   this.creditNoteStats.grand_total.value + Number(item.item_grand_total);
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
    this.creditNoteStats.total_gross.value =
      this.checkIsCommaValue(this.creditNoteStats.total_gross.value) + this.checkIsCommaValue(item.item_gross);
    this.creditNoteStats.total_vat.value =
      this.checkIsCommaValue(this.creditNoteStats.total_vat.value) + this.checkIsCommaValue(item.item_vat);
    this.creditNoteStats.total_excise.value =
      this.checkIsCommaValue(this.creditNoteStats.total_excise.value) + (this.checkIsCommaValue(item.item_excise) * item.item_qty);
    this.creditNoteStats.total_net.value =
      this.checkIsCommaValue(this.creditNoteStats.total_net.value ? this.creditNoteStats.total_net.value : 0) + this.checkIsCommaValue(item.total_net);
    this.creditNoteStats.total_discount_amount.value =
      this.checkIsCommaValue(this.creditNoteStats.total_discount_amount.value)
      + this.checkIsCommaValue(item.item_discount_amount);
    this.creditNoteStats.grand_total.value =
      this.checkIsCommaValue(this.creditNoteStats.grand_total.value) + this.checkIsCommaValue(item.item_grand_total);
    console.log(this.creditNoteStats);
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
  private resetStats() {
    this.creditNoteStats.total_gross.value = 0;
    this.creditNoteStats.total_vat.value = 0;
    this.creditNoteStats.total_excise.value = 0;
    this.creditNoteStats.total_net.value = 0;
    this.creditNoteStats.total_discount_amount.value = 0;
    this.creditNoteStats.grand_total.value = 0;
  }
  private setupPayloadItemArray(
    form: FormGroup,
    result?: ApiItemPriceStats
  ): OrderItemsPayload {
    if (result) {
      return {
        item: form.controls.item.value,
        item_id: form.controls.item.value.id,
        item_qty: form.controls.item_qty.value,
        item_expiry_date: form.controls.item_expiry_date.value,
        item_condition: 1,
        batch_number: null,
        item_uom_id: form.controls.item_uom_id.value,
        reason: form.controls.reason.value || null,
        discount_id: result ? result.discount_id : null,
        promotion_id: result ? result.promotion_id : null,
        is_free: result ? result.is_free : false,
        is_item_poi: result ? result.is_item_poi : false,
        item_price: result ? +result.item_price : 0,
        item_discount_amount: result ? +result.discount : 0,
        item_vat: result ? +result.total_vat : 0,
        item_net: result ? +result.total_net : 0,
        total_net: result && result.net_gross ? Number(result.net_gross) - Number(result.discount) : 0,
        item_excise: result ? +result.total_excise : 0,
        total_excise:
          result && result.net_excise ? Number(result.net_excise) : 0,
        item_grand_total: result ? +result.total : 0,
        item_gross: result && result.net_gross ? Number(result.net_gross) : 0,
        invoice_number: form.controls.invoice_number.value || null,
        invoice_total: form.controls.invoice_total.value || null,
      };
    } else {
      return {
        item: form.controls.item.value,
        item_id: form.controls.item.value.id,
        item_qty: form.controls.item_qty.value,
        item_expiry_date: form.controls.item_expiry_date.value,
        item_condition: 1,
        batch_number: null,
        item_uom_id: form.controls.item_uom_id.value,
        reason: form.controls.reason.value || null,
        discount_id: result ? result.discount_id : null,
        promotion_id: result ? result.promotion_id : null,
        is_free: result ? result.is_free : false,
        is_item_poi: result ? result.is_item_poi : false,
        item_price: form.controls.item_price.value,
        item_discount_amount: form.controls.item_discount_amount.value,
        item_vat: form.controls.item_vat.value,
        item_net: form.controls.item_net.value,
        total_net: result && result.net_gross ? Number(result.net_gross) - Number(result.discount) : 0,
        item_excise: form.controls.item_excise.value,
        total_excise:
          result && result.net_excise ? Number(result.net_excise) : 0,
        item_grand_total: form.controls.item_grand_total.value,
        item_gross: result && result.item_gross ? Number(result.item_gross) : 0,
        invoice_number: form.controls.invoice_number.value || null,
        invoice_total: form.controls.invoice_total.value || null,
      };
    }

  }

  private makeOrderPostCall(): void {
    if (!this.checkFormValidation()) {
      return;
    }
    const type =
      this.creditNoteData && this.creditNoteData.uuid ? 'edit' : 'create';
    if (type === 'create') {
      this.subscriptions.push(
        this.creditNoteService
          .addCreditNote(this.finalOrderPayload)
          .subscribe((result) => {
            this.toaster.showSuccess(
              'Success',
              'Credit not has been added successfuly.'
            );
            this.router.navigate(['transaction/credit-note']);
          })
      );
    } else if (type === 'edit') {
      this.subscriptions.push(
        this.creditNoteService
          .editCreditNote(this.creditNoteData.uuid, this.finalOrderPayload)
          .subscribe((result) => {
            this.toaster.showSuccess(
              'Success',
              'Credit not has been updated successfuly.'
            );
            this.router.navigate(['transaction/credit-note']);
          })
      );
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
export const ITEM_ADD_FORM_TABLE_HEADS1: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 1, key: 'item', label: 'Item Code', show: true },
  { id: 2, key: 'itemName', label: 'Item Name', show: true },
  { id: 3, key: 'uom', label: 'UOM', show: true },
  { id: 4, key: 'qty', label: 'Quantity', show: true },
  { id: 5, key: 'itemExpiryDate', label: 'Expiry Date', show: true },
  { id: 6, key: 'reason', label: 'Reason', show: true },
  { id: 7, key: 'price', label: 'Price', show: true },
  { id: 8, key: 'excise', label: 'Excise', show: true },
  { id: 9, key: 'discount', label: 'Discount', show: true },
  { id: 10, key: 'vat', label: 'Vat', show: true },
  { id: 11, key: 'net', label: 'Net', show: true },
  { id: 12, key: 'total', label: 'Total', show: true },
  // { id: 12, key: 'weight', label: 'Weight', show: true },
  // { id: 13, key: 'ohq', label: 'On Hand Qty', show: true },
];
