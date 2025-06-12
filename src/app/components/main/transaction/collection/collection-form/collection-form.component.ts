import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { ValidatorService } from './../../../../../services/validator.service';
import { mergeMap, delay } from 'rxjs/operators';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, Subject, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';

import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import {
  OrderModel,
  apiOrderMapper,
} from 'src/app/components/main/transaction/orders/order-models';
import { InfoModal } from '../collection-models';
import { DataEditor } from 'src/app/services/data-editor.service';
import { INVOICE_LIST } from 'src/app/features/mocks';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CollectionService } from '../collection.service';
import { ApiService } from 'src/app/services/api.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MasterService } from '../../../master/master.service';
import { CustomPaggingComponent } from 'src/app/features/shared/custom-pagging/custom-pagging.component';
@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.scss'],
})
export class CollectionFormComponent implements OnInit, OnDestroy {
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  public pageTitle: string;
  public enableManual = false;
  public currentDate: any;
  public tableHeaders: InfoModal[] = [];

  public invoices: OrderModel[] = [];
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public payModes: InfoModal[] = [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Check' }
  ];

  public collectionForm: FormGroup;
  public collectionTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public customerLobFormControl: FormControl;
  public paymentTypeFormControl: FormControl;
  public numberFormControl: FormControl;
  public dateFormControl: FormControl;
  public invoiceAmountFormControl: FormControl;
  public allocatedAmountFormControl: FormControl;
  public clearedAmountFormControl: FormControl;
  public chequeNumberFormControl: FormControl;
  public bankNameFormControl: FormControl;
  public chequeDateFormControl: FormControl;
  public invoicesFormGroups: FormArray;

  public filterCustomer: Customer[] = [];
  isLoading: boolean;
  filterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  itemfilterValue = '';

  private router: Router;
  private collectionService: CollectionService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  public isShow: Boolean = false;
  private elemRef: ElementRef;
  private toaster: CommonToasterService;
  nextCommingNumberPrefix: any;
  creditLimit;
  fromDateControl: FormControl;
  toDateControl: FormControl;
  startInvoice: number = 0;
  endInvoice: number = 10;
  @ViewChild('customPagging', { static: true }) customPagging: CustomPaggingComponent;
  rebateFormControl: FormControl;
  rebateVATFormControl: FormControl;
  shelfRentFormControl: FormControl;
  keyUp = new Subject<string>();
  amount: number = 0;
  newAmount: number = 0;
  calcAmount: number = 0;
  increasedAllactedAmount: number = 0;
  filterColumnName: any;
  selectedColumnFilter: any;
  filterTextValue: string;
  invoiceFormsLength: number;
  constructor(
    collectionService: CollectionService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    toaster: CommonToasterService,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    public apiService: ApiService,
    private masterService: MasterService
  ) {
    Object.assign(this, {
      collectionService,
      dataService,
      dialogRef,
      elemRef,
      formBuilder,
      router,
      route,
      toaster,
      masterService
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

    this.pageTitle = 'New Collection';
    this.getrouteitemgroupCode();
    // this.invoices = INVOICE_LIST.data.map((item) => apiOrderMapper(item));

    // this.customers = this.route.snapshot.data['resolved'].customers.data;
    // this.filterCustomer = this.route.snapshot.data['resolved'].customers.data;

    // // this.custData = this.route.snapshot.data['resolved'].customers.data;

    // if (this.customers.length >= 10) {
    //   this.page++;
    //   this.total_pages = this.route.snapshot.data['resolved'].customers.pagination.total_pages;
    // }

    this.collectionTypeFormControl = this.formBuilder.control(
      1,
      Validators.required
    );
    this.customerFormControl = this.formBuilder.control(
      '',
      Validators.required
    );
    this.customerLobFormControl = new FormControl('');
    this.fromDateControl = new FormControl('');
    this.toDateControl = new FormControl('');
    this.paymentTypeFormControl = this.formBuilder.control(
      1,
      Validators.required
    );
    this.numberFormControl = this.formBuilder.control('', Validators.required);
    this.dateFormControl = this.formBuilder.control(this.currentDate, Validators.required);
    this.rebateFormControl = this.formBuilder.control('');
    this.rebateVATFormControl = this.formBuilder.control('');
    this.shelfRentFormControl = this.formBuilder.control('');
    this.invoiceAmountFormControl = this.formBuilder.control('', [
      Validators.required,
      ValidatorService.numberAndDecimal,
    ]);

    this.allocatedAmountFormControl = this.formBuilder.control('', [
      ValidatorService.numberAndDecimal,
    ]);
    this.clearedAmountFormControl = this.formBuilder.control('', [
      ValidatorService.numberAndDecimal,
    ]);
    this.chequeNumberFormControl = this.formBuilder.control('');
    this.bankNameFormControl = this.formBuilder.control('');
    this.chequeDateFormControl = this.formBuilder.control('');


    this.invoicesFormGroups = this.formBuilder.array([]);

    this.collectionForm = this.formBuilder.group({
      collection_type: this.collectionTypeFormControl,
      collection_number: this.numberFormControl,
      collection_date: this.dateFormControl,
      invoice_amount: this.invoiceAmountFormControl,
      cheque_number: this.chequeNumberFormControl,
      bank_info: this.bankNameFormControl,
      cheque_date: this.chequeDateFormControl,
      paid_invoices: this.invoicesFormGroups,
    });
    this.isLoading = true;
    this.subscriptions.push(
      this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
        this.isLoading = false;
        this.page++;
        this.customers = result.data;
        this.filteredCustomers = result.data;
        this.total_pages = result.pagination?.total_pages;
      })
    );

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
    //       this.lookup$.next(this.page);
    //     })
    // );

    this.subscriptions.push(
      this.paymentTypeFormControl.valueChanges.subscribe((value) => {
        console.log(value);
        this.enableManual = value == '3';
        console.log(this.enableManual);
        this.resetInvoicesPay();
        this.invoiceAmountFormControl.reset();
      })
    );

    this.subscriptions.push(
      this.apiService.getCreditLimits().subscribe((result) => {
        this.creditLimit = result.data;
      })
    );

    this.subscriptions.push(
      this.invoiceAmountFormControl.valueChanges.subscribe((value) => {
        this.allocatedAmountFormControl.setValue(value);
        this.clearedAmountFormControl.setValue(value);
        if (Number(value) <= 0) {
          this.resetInvoicesPay();
        } else {
          switch (this.paymentTypeFormControl.value) {
            case 1:
              this.processFifoPay();
              break;
            case 2:
              this.processLifoPay();
              break;
            case 3:
              this.processManualPay();
              break;
            default:
              this.processFifoPay();
          }
        }
      })
    );

    this.collectionTypeFormControl.valueChanges.subscribe((value) => {
      this.collectionForm.patchValue({
        cheque_number: null,
        bank_info: null,
        cheque_date: null,
      });

      if (value === 2) {
        this.collectionForm
          .get('cheque_number')
          .setValidators([Validators.required, ValidatorService.numbersOnly]);
        this.collectionForm.get('bank_info').setValidators(Validators.required);
        this.collectionForm
          .get('cheque_date')
          .setValidators(Validators.required);
      } else {
        this.collectionForm.get('cheque_number').setValidators([]);
        this.collectionForm.get('bank_info').setValidators([]);
        this.collectionForm.get('cheque_date').setValidators([]);
      }
    });

    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailListTable({ name: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;

        this.total_pages = res?.pagination?.total_pages;
        if (this.filterValue == "") {
          if (this.page > 1) {
            this.customers = [...this.customers, ...res.data];
            this.filteredCustomers = [...this.filteredCustomers, ...res.data];
          } else {
            this.customers = res.data;
            this.filteredCustomers = res.data;
          }
          this.page++;
        } else {
          this.page++;
          this.filteredCustomers = [...this.filteredCustomers, ...res.data];
        }
      });

    this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(res => {
      console.log("res", res)
      if (res)
        this.searchCustomerName(res);
    });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  onScroll() {
    console.log(this.total_pages, this.page, this.isLoading)
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }

  searchCustomerName(value) {
    this.filterValue = value;
    this.page = 1;
    this.filteredCustomers = [];
    this.lookup$.next(this.page);
  }

  public openNumberSettings(): void {
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: {
          title: 'Collection Code',
          functionFor: 'collection',
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
            res.data.next_coming_number_collection
          );
          this.nextCommingNumberPrefix = res.reqData.prefix_code;
          this.numberFormControl.disable();
        }
      });
  }
  getrouteitemgroupCode() {
    let nextNumber = {
      function_for: 'collection',
    };
    this.collectionService
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

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  public processFifoPay(): void {
    this.amount = 0 + Number(this.invoiceAmountFormControl.value);
    this.newAmount = this.amount;
    this.calcAmount = 0;

    this.invoicesFormGroups.controls.forEach((item) => {
      this.calculationPaidAmount(item);

    });
    this.allocatedAmountFormControl.setValue(this.amount.toFixed(2))

    this.allocatePaidAmount();

  }

  public processLifoPay(): void {
    this.amount = 0 + Number(this.invoiceAmountFormControl.value);
    this.newAmount = this.amount;
    this.calcAmount = 0;
    const lastIndex = this.invoicesFormGroups.controls.length - 1;

    for (let i = lastIndex; i >= 0; i--) {
      // const formGroup = this.invoicesFormGroups.controls[i] as FormGroup;
      this.calculationPaidAmount(this.invoicesFormGroups.controls[i]);
    }
    this.allocatedAmountFormControl.setValue(this.amount.toFixed(2))
    this.allocatePaidAmount();

  }


  calculationPaidAmount(item) {
    const formGroup = item as FormGroup;

    if (this.amount <= this.calcAmount) {
      formGroup.controls.paid_amount.setValue(
        Number(0)
      );
      return;
    } else if (formGroup.get('itype').value != "Debit") {
      if (formGroup.get('itype').value == "Credit") {
        formGroup.controls.pending_amount.setValue(-Math.abs(formGroup.controls.pending_amount.value))
      }

      this.calcAmount = Number(
        (this.calcAmount + Number(formGroup.controls.pending_amount.value)).toFixed(2)
      );

      if (this.amount <= this.calcAmount) {
        if (this.amount <= Math.abs(this.calcAmount - this.amount)) {
          formGroup.controls.paid_amount.setValue(
            Number(formGroup.controls.pending_amount.value - this.calcAmount + this.amount).toFixed(2)
          );
        } else if (this.newAmount <= this.amount) {
          formGroup.controls.paid_amount.setValue(
            Number(this.newAmount).toFixed(2)
          );
        } else if (this.newAmount <= Number(formGroup.controls.pending_amount.value)) {
          formGroup.controls.paid_amount.setValue(
            Number(this.newAmount).toFixed(2)
          );
        } else {
          formGroup.controls.paid_amount.setValue(
            Number(this.amount).toFixed(2)
          );
        }
      } else {
        formGroup.controls.paid_amount.setValue(
          Number(formGroup.controls.pending_amount.value).toFixed(2)
        );
      }
      this.newAmount = Math.abs(this.calcAmount - this.amount);
    } else {

      formGroup.controls.pending_amount.setValue(-Math.abs(formGroup.controls.pending_amount.value))
      formGroup.controls.paid_amount.setValue(-Math.abs(formGroup.controls.pending_amount.value))
    }
  }

  private allocatePaidAmount() {
    var newAmount = 0;
    var shelfRentAmount = 0;
    var rebateAmount = 0;
    var rebateVATAmount = 0;
    this.invoicesFormGroups.controls.forEach((item) => {
      const informGroup = item as FormGroup;
      if (informGroup.get('itype').value == "Credit") {
        informGroup.controls.pending_amount.setValue(-Math.abs(informGroup.controls.pending_amount.value))
      }


      if (informGroup.get('itype').value != "Debit") {
        if (informGroup.get('itype').value == "Credit") {
          newAmount = Number(newAmount - Math.abs(informGroup.controls.paid_amount.value));
        } else {
          newAmount = Number(newAmount + Math.abs(informGroup.controls.paid_amount.value));
        }

        this.allocatedAmountFormControl.setValue(newAmount.toFixed(2));
        this.increasedAllactedAmount = 0;
        if (this.amount < this.allocatedAmountFormControl.value) {
          this.increasedAllactedAmount = this.allocatedAmountFormControl.value - this.amount;
        }
      } else {
        if (informGroup.controls.paid_amount.value != 0) {
          if (informGroup.get('debittype').value == "rebate_discount") {
            rebateAmount = Number(rebateAmount + Math.abs(informGroup.controls.netamount.value));
            rebateVATAmount = Number(rebateVATAmount + Math.abs(informGroup.controls.vatamount.value));
          } else {
            shelfRentAmount = Number(shelfRentAmount + Math.abs(informGroup.controls.paid_amount.value));
          }
        }
      }
    });

    this.shelfRentFormControl.setValue(shelfRentAmount.toFixed(2));
    this.rebateFormControl.setValue(rebateAmount.toFixed(2));
    this.rebateVATFormControl.setValue(rebateVATAmount.toFixed(2));

  }
  public processManualPay(): void {
    this.allocatedAmountFormControl.setValue(0)
  }

  public resetInvoicesPay(): void {
    this.invoicesFormGroups.controls.forEach((item) => {
      const formGroup = item as FormGroup;
      formGroup.controls.paid_amount.setValue(0);
    });
  }

  public setupInvoicesFormControl(): void {
    this.invoices.forEach((invoice: any, index: number) => {
      const newFormGroup = this.formBuilder.group({
        id: new FormControl(invoice.invid),
        customer_code: new FormControl(invoice.customer_code),
        customer_name: new FormControl(invoice.customername),
        invoice_date: new FormControl({
          value: invoice.invdate,
          disabled: true,
        }),
        invoice_number: new FormControl(invoice.invoicenumber),
        total_amount: new FormControl({
          value: (invoice.itype == 'Credit' || invoice.itype == 'Debit') && -Math.abs(invoice.grand_total) || invoice.grand_total,
          disabled: true,
        }),
        itype: new FormControl(invoice.itype),
        pending_amount: new FormControl({ value: invoice.pending_amount, disabled: true, }),
        paid_amount: new FormControl(0),
        debittype: new FormControl(invoice.debittype),
        netamount: new FormControl(invoice.netamount),
        vatamount: new FormControl(invoice.vatamount),
        show: new FormControl(false),
      });
      this.invoicesFormGroups.push(newFormGroup);
    });

    this.invoiceFormsLength = this.invoicesFormGroups.length;
  }

  checkPaidAmount(invoice) {
    var i = this.invoiceForms.findIndex(x => x.get('invoice_number').value == invoice.get('invoice_number').value)
    let formGroup = this.invoiceForms[i];
    let amount = 0 + Number(this.invoiceAmountFormControl.value);
    let allocated_amount = 0 + Number(this.allocatedAmountFormControl.value);

    if (formGroup.get('itype').value == "Credit") {
      formGroup.get('pending_amount').setValue(-Math.abs(formGroup.get('pending_amount').value))
    }
    console.log(parseInt(formGroup.get('pending_amount').value), formGroup.get('paid_amount').value)
    if (Number(formGroup.get('paid_amount').value) >= Number(formGroup.get('pending_amount').value)) {
      formGroup.get('paid_amount').setValue(Number(formGroup.get('pending_amount').value))
    }
    this.allocatePaidAmount();

    if (this.increasedAllactedAmount > 0) {
      this.allocatedAmountFormControl.setValue(this.amount);
      if (Number(formGroup.get('paid_amount').value) < this.increasedAllactedAmount) {
        formGroup.get('paid_amount').setValue(0);

      } else
        formGroup.get('paid_amount').setValue(Number(formGroup.get('paid_amount').value) - this.increasedAllactedAmount);
    }
  }

  public get invoiceForms(): AbstractControl[] {
    return this.invoicesFormGroups.controls;
  }

  public clearInvoice(index: number): void {
    this.invoices.splice(index, 1);
    this.invoicesFormGroups.removeAt(index);
  }

  public customerSelected(): void {
    this.filterValue = '';

    this.isShow = this.customerFormControl.value.is_lob == 1 ? true : false;
    this.isShow == true ? this.getCustomerLobList() : '';
    if (this.customerFormControl.value.customer_group_id != null && this.customerFormControl.value.customer_group_id > 0) {
      this.getGroupFilterecInvocies();
    } else {
      this.getFilteredInvoices();
    }
  }
  customerLobList = [];
  getCustomerLobList() {
    this.isShow = this.customerFormControl.value.is_lob == 1 ? true : false;
    console.log(this.customerFormControl.value);
    this.apiService.getLobsByCustomerId(this.customerFormControl.value?.user_id).subscribe((result) => {
      this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
    })
  }

  public customerLobSelected(): void {
    if (this.customerFormControl.value.customer_group_id != null && this.customerFormControl.value.customer_group_id > 0) {
      this.getGroupFilterecInvocies();
    } else {
      this.getFilteredInvoices();
    }
  }

  public customerControlDisplayValue(customer: Customer): string {
    return customer
      ? `${customer.user.firstname} ${customer.user.lastname}`
      : '';
  }

  public addCustomer(): void {
    this.router.navigate(['masters/customer'], {
      queryParams: { create: true },
    });
  }

  getFilteredInvoices() {
    let body = {
      customer_id: this.customerFormControl.value.user_id,
      lob_id: this.customerLobFormControl.value.length ? this.customerLobFormControl.value[0].id : '',
      start_date: this.fromDateControl.value,
      end_date: this.toDateControl.value,
    }
    this.collectionService.getPendingInvoiceByDates(body).subscribe(
      (response) => {
        this.invoicesFormGroups.controls.length = 0;
        this.invoices = response.data;
        this.setupInvoicesFormControl();
      },
      (error) => {
        //console.log(error);
      }
    );
  }

  getGroupFilterecInvocies() {
    let body = {
      lob_id: this.customerFormControl.value.customer_group_id,
      start_date: this.fromDateControl.value,
      end_date: this.toDateControl.value,
    }
    this.collectionService.getPendingGroupInvoiceByDates(body).subscribe((response) => {
      this.invoicesFormGroups.controls.length = 0;
      this.invoices = response.data;
      this.setupInvoicesFormControl();
    }, (error) => {

    })
  }

  public saveCollection(): void {
    if (Number(this.allocatedAmountFormControl.value) != Number(this.invoiceAmountFormControl.value)) {
      return;
    }
    console.log('collectionTypeFormControl', this.collectionTypeFormControl.value)
    const form = JSON.parse(JSON.stringify(this.collectionForm.value));
    var array = [];
    var shelf_rent = 0;
    form.paid_invoices.forEach(element => {
      var type;
      if (element.paid_amount !== 0) {
        if (element.itype == "Credit") {
          type = 3;
        } else if (element.itype == "Invoice") {
          type = 1;
        } else {
          type = 2;
          shelf_rent = Number(shelf_rent + element.paid_amount);
        }
        array.push({
          invoice_id: element.id,
          amount: element.paid_amount,
          type: type,
          customer_id: this.customerFormControl.value.user_id,
          lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || ""
        })

      }
    });
    form['items'] = array;
    delete form['paid_invoices'];
    form.collection_number = this.numberFormControl.value;
    form.customer_id = this.customerFormControl.value.user_id;
    form.lob_id = this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
      form.invoice_amount = this.allocatedAmountFormControl.value - Math.abs(this.shelfRentFormControl.value - this.rebateFormControl.value - this.rebateVATFormControl.value);
    form.collection_type = this.paymentTypeFormControl.value;
    form.payemnt_type = this.collectionTypeFormControl.value;
    form.shelf_rent = shelf_rent;
    form.allocated_amount = this.allocatedAmountFormControl.value;
    form.cleared_amount = this.clearedAmountFormControl.value;
    form.status = '1';
    form.salesman_id = '';
    form.transaction_number = '';
    form.source = 3;
    form.discount = 0;
    form.rebate_amount = this.rebateFormControl.value;
    form.rebate_vat_value = this.rebateVATFormControl.value
    form.is_rebateVat = this.rebateFormControl.value ? true : false;
    console.log('Form', form);
    this.collectionService.addCollection(form).subscribe(
      (response) => {
        this.toaster.showSuccess(
          'Success',
          'Collection has been added successfuly.'
        );
        this.router.navigateByUrl('/transaction/collection');
      },
      (error) => { }
    );
  }

  private filterCustomers(customerName: string): Customer[] {
    const filterValue = customerName.toLowerCase();

    return this.customers.filter(
      (customer) =>
        customer.user.firstname.toLowerCase().includes(filterValue) ||
        customer.user.lastname.toLowerCase().includes(filterValue)
    );
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
    this.filterColumnName = item;
  }
  onColumnFilter(item) {
    if (!item) {
      this.filterTextValue = ''
    } else {

    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    this.filterTextValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    switch (this.filterColumnName) {
      case 'customer_code':
        this.invoiceForms.forEach(x => {

          if (x.get('customer_code').value.toLowerCase().indexOf(this.filterTextValue) > -1) {
            x.get('show').setValue(false);
          } else {
            x.get('show').setValue(true);

          }
        });
      case 'customer_name':
        this.invoiceForms.forEach(x => {
          if (x.get('customer_name').value.toLowerCase().indexOf(this.filterTextValue) > -1) {
            x.get('show').setValue(false);
          } else {
            x.get('show').setValue(true);
          }
        });
        break;
      case 'invoice_number':
        this.invoiceForms.forEach(x => {
          if (x.get('invoice_number').value.toLowerCase().indexOf(this.filterTextValue) > -1) {
            x.get('show').setValue(false);
          } else {
            x.get('show').setValue(true);
          }
        });
        break;
      case 'itype':
        this.invoiceForms.forEach(x => {
          if (x.get('itype').value.toLowerCase().indexOf(this.filterTextValue) > -1) {
            x.get('show').setValue(false);
          } else {
            x.get('show').setValue(true);
          }
        });
        break;
    }


    this.invoiceFormsLength = this.invoiceForms.filter(x => !x.get('show').value).length;
  }

  checkAvailability() {
    return this.invoiceForms.filter(x => !x.get('show').value);
  }

  previousInvoices() {
    if (this.startInvoice > 0) {
      if (this.invoicesFormGroups.length == this.endInvoice) {
        this.endInvoice = this.invoicesFormGroups.length - this.startInvoice;
        this.endInvoice = this.invoicesFormGroups.length - this.endInvoice;
      } else
        this.endInvoice = this.endInvoice - 10;

      this.startInvoice = this.startInvoice - 10;

    }
  }

  nextInvoices() {
    if (this.invoicesFormGroups.length > this.endInvoice) {
      this.startInvoice = this.startInvoice + 10;
      this.endInvoice = this.endInvoice + 10;
      if (this.invoicesFormGroups.length < this.endInvoice) {
        this.endInvoice = this.invoicesFormGroups.length;
      }
    }
  }
}

const INVOICE_TABLE_HEADERS: InfoModal[] = [
  { id: 0, name: '#' },
  { id: 1, name: 'Invoice Date' },
  { id: 2, name: 'Invoice Number' },
  { id: 4, name: 'Total Amount' },
  { id: 5, name: 'Paid Amount' },
];
