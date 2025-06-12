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
import { Subscription, Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map, startWith, distinctUntilChanged, exhaustMap } from 'rxjs/operators';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { BranchDepotMaster } from 'src/app/components/main/settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderItemsPayload,
  OrderType,
  OrderUpdateProcess,
} from 'src/app/components/main/transaction/orders/order-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { DebitNoteService } from '../debit-note.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { ReasonFormComponent } from 'src/app/components/dialog-forms/reason-form/reason-form.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MasterService } from '../../../master/master.service';
import { AnyARecord } from 'dns';
@Component({
  selector: 'app-debit-note-form',
  templateUrl: './debit-note-form.component.html',
  styleUrls: ['./debit-note-form.component.scss'],
})
export class DebitNoteFormComponent implements OnInit, OnDestroy {
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  public pageTitle: string;
  public isEditForm: boolean;
  public currentDate: any;
  public isDeliveryForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public orderNumber: string;
  public debitNoteData: any;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
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

  public orderFormGroup: FormGroup;
  public customerFormControl: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public numberFormControl: FormControl;
  public reasonFormControl: FormControl;
  public paymentTermFormControl: FormControl;
  public debitNoteDateFormControl: FormControl;
  public supRecptNumFormControl: FormControl;
  public supRecptDateFormControl: FormControl;
  public rootReasonSelected: string = '';
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public itemTableHeaders0: ItemAddTableHeader[] = [
    { id: 0, key: 'sequence', label: '#', show: true },
    { id: 1, key: 'item', label: 'Item Name', show: true },
    { id: 2, key: 'amount', label: 'Amount', show: true },
    { id: 3, key: 'price', label: 'Price', show: true },
    { id: 4, key: 'discount', label: 'Discount', show: true },
    { id: 5, key: 'vat', label: 'Vat', show: true },
    { id: 6, key: 'net', label: 'Net', show: true },
    { id: 7, key: 'total', label: 'Total', show: true },
  ]
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: any[] = [];
  public depots: BranchDepotMaster[] = [];
  public returnReasons: { id: number; name: string }[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: any[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];
  public nextCommingDebitNoteCode: string = '';
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public filterCustomer: Customer[] = [];
  isLoading: boolean;
  filterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  itemfilterValue = '';

  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedReasonId: number;
  public selectedPaymentTermId: number;
  public is_lob: boolean = false;

  private router: Router;
  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private finalDeliveryPayload: any = {};
  nextCommingDebitNoteCodePrefix: any;
  creditLimit;
  constructor(
    private debitNoteService: DebitNoteService,
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    private masterService: MasterService
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
    // this.customerFormControl.disable();
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

    this.isEditForm = this.router.url.includes('transaction/debit-note/edit/');
    this.isDeliveryForm = this.router.url.includes(
      'transaction/debit-note/start-delivery/'
    );
    this.buildForm();
    this.setTableHeaders();
    this.subscriptions.push(
      this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
        this.itempage++;
        this.items = result.data;
        this.filteredItems = result.data;
        this.item_total_pages = result.pagination?.total_pages
      })
    );
    //this.customers = this.route.snapshot.data['resolved'].customers.data;
    this.isLoading = true;
    this.subscriptions.push(
      this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
        this.isLoading = false;
        this.page++;
        this.customers = result.data;
        this.filterCustomer = result.data;
        this.total_pages = result.pagination?.total_pages
      })
    );
    //this.customers = this.route.snapshot.data['resolved'].customers.data;
    //this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;

    if (this.isEditForm || this.isDeliveryForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = this.isEditForm
        ? 'Edit Debit Note'
        : 'Customize Debit Note';
      this.debitNoteData = this.route.snapshot.data['note'];
      if (this.debitNoteData?.is_debit_note == 0) {
        let amountIndex = this.itemTableHeaders0.findIndex(x => x.label == "Amount");
        this.itemTableHeaders0[amountIndex].show = false;
        this.customerFormControl.disable();
        this.reasonFormControl.disable();
      }
      this.setupEditFormControls(this.debitNoteData);
      console.log(this.debitNoteData)
    } else {
      this.pageTitle = 'Add Debit Note';
      this.addItemFilterToControl(0);
      this.getDeliveryCode();
    }

    if (this.isDeliveryForm) {
      this.debitNoteDateFormControl.disable();
    }

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

    // this.subscriptions.push(
    //   this.debitNoteService.getReasonList().subscribe((result) => {
    //     this.returnReasons = result.data;
    //   })
    // );

    this.subscriptions.push(
      this.debitNoteService.getReturnReasonsType().subscribe((result) => {
        this.returnReasons = result.data.filter(x => x.type == "Bad Return Reason" || x.type == "Good Return Reason");
      })
    );


    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailListTable({ name: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (this.filterValue == "") {
          if (this.page > 1) {
            this.customers = [...this.customers, ...res.data];
            this.filterCustomer = [...this.filterCustomer, ...res.data];
          } else {
            this.customers = res.data;
            this.filterCustomer = res.data;
          }
          this.page++;
          this.total_pages = res?.pagination?.total_pages;
        } else {
          this.page = 1;
          this.customers = res.data;
          this.filterCustomer = res.data;
        }
      })

    this.itemlookup$
      .pipe(exhaustMap(() => {
        return this.masterService.itemDetailListTable({ item_name: this.itemfilterValue.toLowerCase(), page: this.itempage, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (this.itemfilterValue == "") {
          if (this.itempage > 1) {
            this.items = [...this.items, ...res.data];

            this.filteredItems = [...this.filteredItems, ...res.data];
          } else {
            this.items = res.data;
            this.filteredItems = res.data;
          }
          this.itempage++;
          this.item_total_pages = res?.pagination?.total_pages;
        } else {
          this.itempage = 1;
          this.items = res.data;
          this.filteredItems = res.data;
        }
      })
  }

  buildForm() {
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
    this.reasonFormControl = new FormControl(this.selectedReasonId, [
      Validators.required,
    ]);
    this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId, [
      Validators.required,
    ]);
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl('');
    this.numberFormControl = new FormControl('', [Validators.required]);
    this.debitNoteDateFormControl = new FormControl(this.currentDate, [Validators.required]);

    this.supRecptNumFormControl = new FormControl('');
    this.supRecptDateFormControl = new FormControl(this.currentDate);

    this.orderFormGroup = this.formBuilder.group({
      depot_id: this.depotFormControl,
      debit_note_number: this.numberFormControl,
      reason: this.reasonFormControl,
      reason_id: this.reasonFormControl,
      customer_id: this.customerFormControl,
      lob_id: this.customerLobFormControl,
      debit_note_date: this.debitNoteDateFormControl,
      supplier_recipt_number: this.supRecptNumFormControl,
      supplier_recipt_date: this.supRecptDateFormControl,
      items: this.initItemFormArray(),
    });
    this.numberFormControl.disable();
  }

  customerLobList = [];
  getCustomerLobList(customer, editData?) {
    this.filterValue = '';
    this.page = 1;
    this.lookup$.next(this.page);
    console.log(customer);
    if (customer?.is_lob == 1 || editData.lob) {
      console.log('customer', customer?.is_lob, 'editlob', editData.lob)
      this.is_lob = true;
      this.customerLobFormControl.setValidators([Validators.required]);
      this.customerLobFormControl.updateValueAndValidity();


      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        console.log('result', result)
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          setTimeout(() => {
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
    }

  }

  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }

  filterCustomers(customerName: string) {
    this.page = 1;
    this.filterValue = customerName.toLowerCase() || "";
    this.customers = [];
    this.filterCustomer = [];
    this.isLoading = true
    this.lookup$.next(this.page)
  }

  onScrollItem() {
    if (this.item_total_pages < this.itempage) return;
    this.isLoading = true;
    this.itemlookup$.next(this.itempage);
  }

  getDeliveryCode() {
    let nextNumber = {
      function_for: 'debit_note',
    };
    this.debitNoteService
      .getNextCommingCode(nextNumber)
      .subscribe((res: any) => {
        if (res.status) {
          this.nextCommingDebitNoteCode = res.data.number_is;
          this.nextCommingDebitNoteCodePrefix = res.data.prefix_is;
          if (this.nextCommingDebitNoteCode) {
            this.numberFormControl.setValue(res.data.number_is);
            this.numberFormControl.disable();
          } else if (this.nextCommingDebitNoteCode == null) {
            this.nextCommingDebitNoteCode = '';
            this.numberFormControl.setValue('');
            this.numberFormControl.enable();
          }
        } else {
          this.nextCommingDebitNoteCode = '';
          this.numberFormControl.setValue('');
          this.numberFormControl.enable();
        }
      });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Debit Note Code',
      functionFor: 'debit_note',
      code: this.nextCommingDebitNoteCode,
      prefix: this.nextCommingDebitNoteCodePrefix,
      key: this.nextCommingDebitNoteCode.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.nextCommingDebitNoteCode = '';
          this.numberFormControl.setValue('');
          this.numberFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.nextCommingDebitNoteCode =
            res.data.next_coming_number_debit_note;
          this.numberFormControl.setValue(
            res.data.next_coming_number_debit_note
          );
          this.nextCommingDebitNoteCodePrefix = res.reqData.prefix_code;
          this.numberFormControl.disable();
        }
      });
  }

  getItemStatus(items): boolean {
    let ordStatus: string = '';
    this.debitNoteData.debit_note_details.forEach((item) => {
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

  public get filteredTableHeaders(): ItemAddTableHeader[] {
    return [...this.itemTableHeaders].filter((item) => item.show);
  }

  public setTableHeaders(): void {
    this.itemTableHeaders = [...ITEM_ADD_FORM_TABLE_HEADS];
    this.itemTableHeaders.splice(3, 0, {
      id: 4,
      key: 'reason',
      label: 'Reason',
    });
    this.itemTableHeaders.forEach((head, index) => {
      this.itemTableHeaders[index].id = index;
    });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  public setupEditFormControls(editData: any): void {
    // this.orderTypeChanged(editData.order_type_id);
    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find(
        (cust) => cust.id === editData.customer.customer_id
      );
    this.filteredCustomers.push(customer);

    this.selectedOrderTypeId = editData.order_type_id;
    this.selectedDepotId = editData.depot && editData.depot.depot_id;
    this.selectedPaymentTermId = editData.payment_term_id;
    this.paymentTermFormControl.setValue(editData.payment_term_id);
    editData.customerObj = { id: editData.customer?.customerinfo?.id, user: editData.customer, user_id: editData.customer?.customerinfo?.user_id };
    editData.customer = editData.customer
      ? {
        customer_id: editData.customer.customer_id,
        user_id: editData.customer?.customerinfo?.user_id,
        customer_name: editData.customer
          ? editData.customer.firstname + ' ' + editData.customer.lastname
          : 'Unknown',
      }
      : undefined;
    this.customerFormControl.setValue(editData.customerObj);
    this.getCustomerLobList(editData.customer, editData);
    let customerLob = [{ id: editData.lob_id, itemName: editData.lob?.lob_name }]
    this.customerLobFormControl.setValue(customerLob);
    // this.noteFormControl.setValue(editData.customer_note);
    // this.dueDateFormControl.setValue(editData.due_date);
    this.numberFormControl.setValue(editData.debit_note_number);
    this.debitNoteDateFormControl.setValue(editData.debit_note_date);



    this.reasonFormControl.setValue(editData.reason);
    if (editData.is_debit_note === 1) {
      editData.debit_note_details.forEach((item: any, index: number) => {
        let newItem = this.mapItem(item);
        this.addItemForm(newItem, editData);
        this.itemDidSearched(newItem, index, true);
        console.log('before', this.payloadItems)
        const itemStats = this.payloadItems[index];
        Object.keys(this.payloadItems[index]).forEach((key) => {
          itemStats[key] = newItem[key];
        });
        console.log('after', this.payloadItems)
      });
    } else {
      this.supRecptNumFormControl.setValue(editData.supplier_recipt_number);
      this.supRecptNumFormControl.setValidators([Validators.required]);
      this.supRecptNumFormControl.updateValueAndValidity();

      this.supRecptDateFormControl.setValue(editData.supplier_recipt_date);
      this.supRecptDateFormControl.setValidators([Validators.required]);
      this.supRecptDateFormControl.updateValueAndValidity();
      editData?.debit_note_listingfee_shelfrent_rebatediscount_details.forEach((item, index) => {
        this.payloadItems[index] = this.setupPayloadItemArrayDebitNote1(item);
      })
    }
    Object.keys(this.orderFinalStats).forEach((key) => {
      this.orderFinalStats[key].value = editData[key];
    });
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
      item_grand_total: Number(apiItem?.item_grand_total),
      item_net: Number(apiItem?.item_net),
      discount_id: apiItem?.discount_id,
      is_free: Boolean(apiItem?.is_free),
      is_item_poi: Boolean(apiItem?.is_item_poi),
      item_gross:
        apiItem && apiItem.item_gross ? Number(apiItem?.item_gross) : 0,
      order_status: apiItem && apiItem.order_status ? apiItem.order_status : '',
      id: apiItem ? apiItem.id : 0,
      reason: apiItem.reason
    };
    return newItem;
  }

  public addItemForm(item?: any, editData?: any): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl({ id: item?.item.id, code: item?.item.item_code, name: item?.item.name }, [
            Validators.required,
          ]),
          item_name: new FormControl(item?.item.name,
            [Validators.required]
          ),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          return_reason_id: new FormControl(item.reason, [Validators.required]),
          return_reason_name: new FormControl(item.reason, [Validators.required]),
          item_uom_list: new FormControl([item.item_uom]),
          item_qty: new FormControl(item.item_qty, [Validators.required]),
        })
      );
    }
    else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_name: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          return_reason_id: new FormControl(undefined, [Validators.required]),
          return_reason_name: new FormControl(undefined, [Validators.required]),
          item_uom_list: new FormControl([]),
          item_qty: new FormControl(1, [Validators.required]),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  public reasonChanged(id: number): void {
    if (id) {
      this.selectedReasonId = id;
      this.reasonFormControl.setValue(id);
    }
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
    this.router.navigate(['transaction/debit-note']);
  }

  goBackToDebitList() {
    this.router.navigate(['transaction/debit-note']);
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

  // public channelProvider(): Observable<any[]> {
  //   return this.debitNoteService
  //     .getReasonList()
  //     .pipe(map((result) => result.data));
  // }
  public channelProvider(): Observable<any[]> {
    return this.debitNoteService
      .getReturnReasonsType()
      .pipe(map((result) => result.data.filter(x => x.type == "Bad Return Reason" || x.type == "Good Return Reason")));
  }
  public channelSelected(data: any): void {
    this.rootReasonSelected = data.name;
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
        this.debitNoteService
          .getReturnReasonsType()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((reasons) => {
            this.returnReasons = reasons;
          });
        if (!result) {
          return;
        }
        this.rootReasonSelected = result.name;
        this.reasonFormControl.setValue(result.id);
      });
  }

  public openReason(index: number): void {
    this.dialogRef
      .open(ReasonFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.debitNoteService
          .getReturnReasonsType()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((reasons) => {
            this.returnReasons = reasons;
          });
        if (!result) {
          return;
        }
        const itemFormGroup = this.itemFormControls[index] as FormGroup;
        itemFormGroup.controls.return_reason_name.patchValue(result, {
          emitEvent: false,
        });
        itemFormGroup.controls.return_reason_id.patchValue(result.name);
      });
  }

  public customerControlDisplayValue(customer: Customer): string {
    return customer
      ? customer?.user?.firstname + ' ' + customer?.user?.lastname
      : '';
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
      // const selectedItem = this.items.find(
      //   (item: any) => item.id === data.item_id
      // );
      let selectedItem = data;
      selectedItem['lower_unit_uom_id'] = data?.item?.item_uom_lower_unit?.id || 0;
      selectedItem['item_main_price'] = data?.item?.item_main_price || [];
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      this.setUpRelatedUom(selectedItem, itemFormGroup, true);
    } else if (!isFromEdit) {
      const selectedItem = this.items.find((item: Item) => item.id === data.id);
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      const itemnameControl = itemFormGroup.controls.item_name;
      itemnameControl.setValue(data.name);
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    }
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

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm || this.isDeliveryForm) {
      console.log('editcontrols')
      return formArray;
    }
    console.log('new form controls')

    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        return_reason_id: new FormControl(undefined, [Validators.required]),
        return_reason_name: new FormControl('', [Validators.required]),
        item_uom_list: new FormControl([]),
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
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .pipe(
          startWith<string | Item>(''),
          map((value) => (typeof value === 'string' ? value : value.item_name)),
          map((value: string) => {
            return value;
          })
        ).subscribe((res) => {
          this.itemfilterValue = res || "";
          this.itempage = 1;
          this.itemlookup$.next(this.itempage)
        })
    );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.valueChanges
        .pipe(
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .subscribe((result) => {
          const groupIndex = itemControls.controls.indexOf(newFormGroup);
          this.payloadItems[groupIndex] = this.setupPayloadItemArray(
            newFormGroup
          );
          if (
            newFormGroup.controls['item'].value &&
            newFormGroup.controls['item_uom_id'].value
          ) {
            const body: any = {
              item_id: result.item.id,
              item_uom_id: result.item_uom_id,
              item_qty: result.item_qty,
              customer_id: this.isDepotOrder
                ? ''
                : (this.customerFormControl.value?.id || this.customerFormControl.value?.user_id),
              lob_id: this.isDepotOrder
                ? ''
                : (this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || ""),
              depot_id: this.isDepotOrder ? this.depotFormControl.value : null,
            };
            if (body.item_qty > 0) {
              this.subscriptions.push(
                this.apiService.getOrderItemStats(body).subscribe(
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
                'Item QTY should atleast be 1'
              );
              this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                newFormGroup,
                this.setupEmptyItemValue
              );
              this.generateOrderFinalStats(false, false);
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

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();
    return this.items.filter((item) =>
      item?.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }

  public checkFormValidation(): boolean {
    if (!this.isDepotOrder && this.customerFormControl.invalid) {
      Utils.setFocusOn('customerFormField');
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
    if (this.supRecptNumFormControl.invalid) {
      Utils.setFocusOn('supRecptNumField');
      return false;
    }
    if (this.supRecptDateFormControl.invalid) {
      Utils.setFocusOn('supRecptDateField');
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
        this.deliveryFinalStats.total_gross.value + item.item_grand_total;
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
      this.orderFinalStats.total_gross.value + item.item_grand_total;
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
      item_price: result && result.item_price ? Number(result.item_price) : 0,
      item_discount_amount:
        result && result.discount ? Number(result.discount) : 0,
      item_vat: result && result.total_vat ? Number(result.total_vat) : 0,
      item_net: result && result.total_net ? Number(result.total_net) : 0,
      item_excise:
        result && result.total_excise ? Number(result.total_excise) : 0,
      item_grand_total: result && result.total ? Number(result.total) : 0,
      item_gross: result && result.item_gross ? Number(result.item_gross) : 0,
      reason: form.controls.return_reason_id.value,
    };
  }

  private setupPayloadItemArrayDebitNote1(
    result?: any
  ) {
    return {
      amount: result.amount,
      customer_id: result.customer_id,
      date: result.date,
      debit_note_id: result.debit_note_id,
      item_discount_amount: result.item_discount_amount,
      item_grand_total: result.item_grand_total,
      item_gross: result.item_gross,
      item_name: result.item_name,
      item_net: result.item_net,
      item_price: result.item_price,
      item_vat: result.item_vat,
      type: result.type,
    };
  }

  public postFinalPayload(target: string): void {
    const totalStats = {};
    Object.keys(this.orderFinalStats).forEach((key: string) => {
      totalStats[key] = this.orderFinalStats[key].value;
    });
    let body = this.orderFormGroup.value;
    const finalPayload = {
      ...body,
      ...totalStats,
      source: 3,
      status: 1,
    };
    console.log(this.payloadItems);
    finalPayload['customer_id'] = this.customerFormControl.value.user_id;
    finalPayload['lob_id'] = this.customerLobFormControl.value[0]?.id || "";
    finalPayload['debit_note_number'] = this.numberFormControl.value;
    // finalPayload['reason'] = this.rootReasonSelected;
    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;
    finalPayload['debit_note_comment'] = 'pending';
    finalPayload.items.forEach((item, i) => {
      item['item_condition'] = 1;
      item['batch_number'] = null;
    });

    this.finalDeliveryPayload = { ...finalPayload };

    // this.finalDeliveryPayload.items = this.selectedPayloadItems.length ? this.selectedPayloadItems : this.payloadItems;
    // if (this.selectedPayloadItems.length) {
    //   Object.keys(this.deliveryFinalStats).forEach((key: string) => {
    //     this.finalDeliveryPayload[key] = this.deliveryFinalStats[key].value;
    //   });
    //   this.finalDeliveryPayload['total_qty'] = this.selectedPayloadItems.length;
    // }

    this.makeOrderPostCall();
  }

  private makeOrderPostCall(): void {
    if (!this.checkFormValidation()) {
      return;
    }

    if (this.isEditForm) {
      this.debitNoteService
        .editDebitNoteList(this.uuid, this.finalDeliveryPayload)
        .subscribe(
          (res: any) => {
            if (res.status) {
              this.commonToasterService.showSuccess(
                'Debit note',
                'Updated Sucessfully'
              );
              this.router.navigate(['transaction/debit-note']);
            }
          },
          (error) => {
            this.commonToasterService.showError(
              '',
              'Debit note updating failed'
            );
          }
        );
    } else {
      this.debitNoteService.addDebitNote(this.finalDeliveryPayload).subscribe(
        (res: any) => {
          if (res.status) {
            this.commonToasterService.showSuccess(
              'Debit note',
              'Added Sucessfully'
            );
            this.router.navigate(['transaction/debit-note']);
          }
        },
        (error) => {
          this.commonToasterService.showError('', 'Debit note added failed');
        }
      );
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
