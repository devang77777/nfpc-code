import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CashierReceiptService } from '../../cashier-receipt.service';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-add-cashier-receipt-overview',
  templateUrl: './add-cashier-receipt-overview.component.html',
  styleUrls: ['./add-cashier-receipt-overview.component.scss'],
})
export class AddCashierReceiptOverviewComponent implements OnInit, OnChanges {
  @Input() isOpenedForDetail: boolean = false;
  @Input() recalculateReceipt: boolean = false;
  @Output() formValid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() currentCashierData: EventEmitter<any> = new EventEmitter<any>();
  public cashFormGroup: FormGroup | any;
  public receiptFormGroup: FormGroup | any;
  public NameFormControl: FormControl | any;
  public routeFormControl: FormControl | any;
  public amountFormControl: FormControl | any;
  public CodeFormControl: FormControl | any;
  public remarksFormControl: FormControl | any;

  public dateFormControl: FormControl | any;
  public bankFormControl: FormControl | any;
  public searchRout: FormControl | any;
  public searchSales: FormControl | any;
  public totalCash: number = 2500;
  public formChangeArray: any[] = [];
  public calculatedTotalCash: number = 0;
  public calculatedTotalCheque: number = 0;
  public calculatedTotalNeft: number = 0;
  public opencashiertable: boolean = false;
  public varienceCashFormControl: FormControl | any;
  public varienceCheckFormControl: FormControl | any;
  public varienceCreditCardFormControl: FormControl | any;
  public varienceFormGroup: FormGroup | any;
  public collectionDataCash: any[] = [];
  // public collectionData: any[] = [];
  public collectionDetails: any[] = [];
  public collectionDataCheque: any[] = [];
  public collectionDataNeft: any[] = [];
  public actualCashAmountFormControl: FormControl | any;
  public actualCheckAmountFormControl: FormControl | any;
  public actualCreditCardAmountFormControl: FormControl | any;
  public actualAmountFormGroup: FormGroup | any;
  public cashierReceiptData: any;
  public cashPaymentPayload: CashObject | any;
  public chequePaymentPayload: CashObject | any;
  public neftPaymentPayload: CashObject | any;
  public openchecktable: boolean = false;
  public openCreditCardTable: boolean = false;
  public isValidOverviewFormCheck: boolean = true;
  public openTable: boolean = false;
  public nextCommingNumberofOrderCode: string | any;
  public finalCashierPayload = {};
  public bankList: any[] = [];
  public cashierInput: FormGroup | any;
  public cashierOutPut: FormGroup | any;

  public recieptData: any;
  public returnsData: any;
  CashInvoiceData:any;
  CollectionData:any;
  DownpaymentData:any;

  public invoiceStempData: any;
  displayedColumns: string[] = [
    'collection',
    'invoice',
    'collection_date',
    'paid',
    'balance',
  ];
  displayedColumns1: string[] = [
    'collection',
    'invoice',
    'collection_date',
    'checkno',
    'check_date',
    'bank',
    'paid',
    'balance',
  ];
  displayedColumns2: string[] = [
    'collection',
    'invoice',
    'collection_date',
    'credit_card_tranx_no',
    'paid',
    'balance',
  ];
  displayedTotalColumns: string[] = [
    'emptyFooter',
    'emptyFooter',
    'actualAmountTitle',
    'actualAmount',
    'varience',
  ];
  displayedTotalColumns1: string[] = [
    'emptyFooter',
    'emptyFooter',
    'emptyFooter',
    'emptyFooter',
    'emptyFooter',
    'actualAmountTitle',
    'actualAmount',
    'varience',
  ];
  displayedTotalColumns2: string[] = [
    'emptyFooter',
    'emptyFooter',
    'emptyFooter',
    'actualAmountTitle',
    'actualAmount',
    'varience',
  ];
  displayedColumns3: string[] = [
    'trxn_no',
    'trxn_date',
    'trxn_date2',
    'invoice_type',
    'receipt_type',
    'type',
    'customer_code',
    'customer_name',
    'rec_no',
    'inv_amt',
    'paid',
    // 'exercise_amount',
    // 'net_amount',
    'balance',
    'stamp',
  ];

  private pendingSalesColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: false },
    { def: 'receipt_no', title: 'Recpt No', show: false },
    { def: 'invoice_no', title: 'Invoice No', show: true },
    { def: 'salesman_code', title: 'Salesman', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'customer_code', title: 'Customer', show: true },
    { def: 'type', title: 'Type', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'collected_amount', title: 'Collected Amount', show: false },
    { def: 'remaining_amount', title: 'Remaining Amount', show: true },
    { def: 'is_stemp', title: 'Is Stemp', show: true },
    { def: 'receipt_date', title: 'Receipt Date', show: true },
  ];
  public displayedpendingColumns: ColumnConfig[] = [];
  public hiddenAutoGenerateIcon: boolean = false;
  public formType: string = '';
  public routeList: any[] = [];
  public salesmanList: any[] = [];
  public isAddForm: boolean = false;
  public disableCondition: CashierDisable | any = {
    NameControl: false,
    routeControl: false,
    dateControl: false,
    CodeControl: false,
    varienceCashControl: false,
    varienceCheckControl: false,
    varienceCreditCardControl: false,
    actualCashAmount: false,
    actualCheckAmount: false,
    actualCreditCardAmount: false,
  };
  private fds: FormDrawerService | any;
  private apiService: ApiService | any;
  private dataEditor: DataEditor | any;
  private subscriptions: Subscription[] = [];
  recalculateReceit: boolean = false;
  nextCommingNumberofOrderCodePrefix: any;
  anotherArray: any;
  anotherSalesmanList: any;
  page = 1;
  pageSize = 10;
  paginateData: any = [];
  SelectedIndex: any;
  pendingCollection: any = [];
  invoiceCheckedData: any[] = [];
  dataPendingSource?: MatTableDataSource<any> | any;
  pastInvselection = new SelectionModel<any>(true, []);
  invoices_total: any;
  constructor(
    private cashierReceiptService: CashierReceiptService,
    private fb: FormBuilder,
    fds: FormDrawerService,
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private router: Router
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
    this.cashierReceiptService.cashierChange$.subscribe((res) => {
      if (res) {
        this.recalculateReceit = res;
        //console.log(res);
      }
    });
  }

  public ngOnInit(): void {
    this.isAddForm = this.router.url.includes('finance/cashier-reciept/add');
    this.getBank();
    if (this.isOpenedForDetail) {
      this.buildForm(true);
    } else {
      this.buildForm(false);
    }
    this.buildVarienceForm();
    this.buildActualAmountForm();
    this.buildFormNew();
    this.searchRout = new FormControl('');
    this.searchSales = new FormControl('');

    this.cashierReceiptService.getRoute().subscribe((res: any) => {
      console.log(res,"jii")
      let datalist = res?.data
      datalist.map((data:any,index:any)=>{
          datalist[index].route_name = data?.route_code + "-" +data?.route_name
      })

      if (res.status) {
        console.log(res,"jii")

        this.routeList = datalist;
        this.anotherArray = datalist;
      }
    });

    if (this.isAddForm) {
      this.getOrderCode();
    } else {
      this.dataEditor.newData.subscribe((res: any) => {
        this.cashierReceiptData = res;
        this.setUpEditData();
      });
    }
  }
  getBank() {
    this.cashierReceiptService.getBankDetails().subscribe((res: any) => {
      if (res.status) {
        this.bankList = res.data;
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    //console.log(changes);
  }
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.SelectedIndex = tabChangeEvent.index;
    console.log(this.SelectedIndex);
  }

  buildFormNew() {
    this.cashierInput = this.fb.group({
      route: new FormControl('', [Validators.required]),
      // salesman_id: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
    });
    this.cashierOutPut = this.fb.group({
      slip_number: new FormControl(''),
      bank_id: new FormControl(''),
      slip_date: new FormControl('', [Validators.required]),
      total_amount: new FormControl('', [Validators.required]),
      actual_amount: new FormControl('', [Validators.required]),
      variance: new FormControl('', [Validators.required]),
    });
  }
  valuechange(ev: any) {
    let varienceDiff:any = 0;
    console.log(ev.target.value)
    // if(ev.target.value)
    // {
    //   if(parseFloat(ev.target.value)<=Number(this.cashierOutPut.get('total_amount').value))
    //   {
    //     varienceDiff = (Number(this.cashierOutPut.get('total_amount').value) - parseFloat(ev.target.value)).toFixed(2);

    //   }
    //   else{

    //   }
    // }
    if (ev.target.value != '') {
      let value = parseFloat(this.cashierOutPut.get('total_amount').value.replace(",", ""));
      console.log(value)
      if (Number(ev.target.value) <= Number(value)) {
        varienceDiff = (Number(value) - Number(ev.target.value)).toFixed(2);
      }
    } else {
      varienceDiff = '';
    }
    this.cashierOutPut.get('variance').setValue(varienceDiff);
  }
  buildForm(setValidators: boolean) {
    if (!setValidators) {
      this.NameFormControl = new FormControl('', [Validators.required]);
      this.routeFormControl = new FormControl('', [Validators.required]);
      this.dateFormControl = new FormControl('', [Validators.required]);
      this.bankFormControl = new FormControl('', [Validators.required]);
      this.CodeFormControl = new FormControl('', [Validators.required]);
      this.remarksFormControl = new FormControl('');

      this.cashFormGroup = new FormGroup({
        route: this.routeFormControl,
        name: this.NameFormControl,
        date: this.dateFormControl,
        code: this.CodeFormControl,
        bank: this.bankFormControl,
        remark: this.remarksFormControl,
      });

      this.disableCondition.NameControl = true;
      this.disableCondition.dateControl = true;
    } else {
      this.NameFormControl = new FormControl('');
      this.routeFormControl = new FormControl('');
      this.dateFormControl = new FormControl('');
      this.CodeFormControl = new FormControl('');
      this.bankFormControl = new FormControl('');
      this.remarksFormControl = new FormControl('');

      this.cashFormGroup = new FormGroup({
        route: this.routeFormControl,
        name: this.NameFormControl,
        date: this.dateFormControl,
        code: this.CodeFormControl,
        bank: this.bankFormControl,
        remark: this.remarksFormControl,
      });
    }
  }

  buildVarienceForm() {
    this.varienceCashFormControl = new FormControl(0);
    this.varienceCheckFormControl = new FormControl(0);
    this.varienceCreditCardFormControl = new FormControl(0);

    this.varienceFormGroup = new FormGroup({
      varienceCash: this.varienceCashFormControl,
      varienceCheck: this.varienceCheckFormControl,
      varienceCreditCard: this.varienceCreditCardFormControl,
    });

    this.disableCondition.varienceCashControl = true;
    this.disableCondition.varienceCheckControl = true;
    this.disableCondition.varienceCreditCardControl = true;
  }

  buildActualAmountForm() {
    this.actualCashAmountFormControl = new FormControl(0, [Validators.max(0)]);
    this.actualCheckAmountFormControl = new FormControl(0, [Validators.max(0)]);
    this.actualCreditCardAmountFormControl = new FormControl(0, [
      Validators.max(0),
    ]);

    this.actualAmountFormGroup = new FormGroup({
      actualCashAmount: this.actualCashAmountFormControl,
      actualCheckAmount: this.actualCheckAmountFormControl,
      actualCreditCardAmount: this.actualCreditCardAmountFormControl,
    });
  }

  setUpEditData() {
    this.routeFormControl.setValue(this.cashierReceiptData.route_id);
    this.opentable(false);
    this.getSalesman(this.cashierReceiptData.route_id);
    this.getCollections(this.cashierReceiptData.salesman_id);
    this.NameFormControl.setValue(this.cashierReceiptData.salesman_id);
    this.dateFormControl.setValue(this.cashierReceiptData.date);
    this.CodeFormControl.setValue(
      this.cashierReceiptData.cashier_reciept_number
    );
    this.remarksFormControl.setValue(this.cashierReceiptData.remark);

    if (
      this.cashierReceiptData.cashierrecieptdetail &&
      this.cashierReceiptData.cashierrecieptdetail.length
    ) {
      this.cashierReceiptData.cashierrecieptdetail.forEach(
        (
          item: {
            payemnt_type: string;
            actual_amount: string | number;
            variance: string | number;
            total_amount: string | number;
          },
          i: any
        ) => {
          if (item.payemnt_type == '1') {
            this.actualCashAmountFormControl.setValue(+item.actual_amount);
            this.varienceCashFormControl.setValue(+item.variance);
            this.calculatedTotalCash = +item.total_amount;
          }
          if (item.payemnt_type == '2') {
            this.actualCheckAmountFormControl.setValue(+item.actual_amount);
            this.varienceCheckFormControl.setValue(+item.variance);
            this.calculatedTotalCheque = +item.total_amount;
          }
          if (item.payemnt_type == '3') {
            this.actualCreditCardAmountFormControl.setValue(
              +item.actual_amount
            );
            this.varienceCreditCardFormControl.setValue(+item.variance);
            this.calculatedTotalNeft = +item.total_amount;
          }
        }
      );
    }

    Object.keys(this.disableCondition).forEach((item, i) => {
      this.disableCondition[item] = true;
    });
  }
  getSalesManList() {
    let val = this.cashierInput.get('route').value;
    this.getSalesman(val[0].id);
  }
  getSalesManId() {
    // let val = this.cashierInput.get('salesman_id').value;
    // console.log(val);
  }
  checkChange(changeControl: FormControl, index: number) {
    if (changeControl.valid && index) {
      if (index !== undefined) {
        if (index == 1) {
          this.getSalesman(changeControl.value);
          this.disableCondition.NameControl = false;
          // this.NameFormControl.enable();
        }
        if (index == 2) {
          this.getCollections(changeControl.value);
          this.disableCondition.dateControl = false;
          // this.dateFormControl.enable();
        }
      }

      if (this.formChangeArray.length) {
        let checkindex = this.formChangeArray.findIndex((x) => x == index);
        if (checkindex == -1) {
          this.formChangeArray.push(index);
        }
      } else {
        this.formChangeArray.push(index);
      }
    }
    if (this.formChangeArray.length == 3) {
      this.calculateTotalCash();
      this.calculatedTotaneft();
      this.calculateTotalCheque();
      this.opentable(true);
    }
  }

  changeTotalAmount(indexChange: number) {
    let varienceDiff;
    if (indexChange == 1) {
      let value = +this.actualCashAmountFormControl.value;
      if (value < +this.calculatedTotalCash) {
        varienceDiff = +this.calculatedTotalCash - value;
      } else {
        varienceDiff = 0;
        this.actualCashAmountFormControl.setValue(+this.calculatedTotalCash);
      }
      this.varienceCashFormControl.setValue(+varienceDiff);
    } else if (indexChange == 2) {
      let value = +this.actualCheckAmountFormControl.value;
      if (value < +this.calculatedTotalCheque) {
        varienceDiff = +this.calculatedTotalCheque - value;
      } else {
        varienceDiff = 0;
        this.actualCheckAmountFormControl.setValue(+this.calculatedTotalCheque);
      }
      this.varienceCheckFormControl.setValue(+varienceDiff);
    } else if (indexChange == 3) {
      let value = +this.actualCreditCardAmountFormControl.value;
      if (value < +this.calculatedTotalNeft) {
        varienceDiff = +this.calculatedTotalNeft - value;
      } else {
        varienceDiff = 0;
        this.actualCreditCardAmountFormControl.setValue(
          +this.calculatedTotalNeft
        );
      }
      this.varienceCreditCardFormControl.setValue(+varienceDiff);
    }
  }

  calculateTotalCash() {
    let totalcash: number = 0;
    this.collectionDataCash[0].collectiondetails.forEach(
      (item: { amount: string | number }, i: any) => {
        totalcash += +item.amount;
      }
    );
    this.calculatedTotalCash = totalcash;
    this.varienceCashFormControl.setValue(this.calculatedTotalCash);
  }

  calculateTotalCheque() {
    let totalcash: number = 0;
    this.collectionDataCheque[0].collectiondetails.forEach(
      (item: { amount: string | number }, i: any) => {
        totalcash += +item.amount;
      }
    );
    this.calculatedTotalCheque = totalcash;
    this.varienceCheckFormControl.setValue(this.calculatedTotalCheque);
  }

  calculatedTotaneft() {
    let totalcash: number = 0;
    this.collectionDataCheque[0].collectiondetails.forEach(
      (item: { amount: string | number }, i: any) => {
        totalcash += +item.amount;
      }
    );
    this.calculatedTotalNeft = totalcash;
    this.varienceCreditCardFormControl.setValue(this.calculatedTotalNeft);
  }

  opentable(trigger?: boolean) {
    this.opencashiertable = true;
    this.openchecktable = true;
    this.openCreditCardTable = true;
    if (this.isAddForm && trigger) {
      this.formValid.emit(true);
      this.setUpPayment();
    } else {
      this.formValid.emit(true);
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  getSalesman(id: number) {
    this.cashierReceiptService.getSalesmanByRoute(id).subscribe((res: any) => {
      if (res.status) {
        this.salesmanList = res.data;
        this.anotherSalesmanList = res.data;
      }
    });
  }
  saveCashier() {
    var data = {
      route_id: this.cashierInput.get('route').value[0].id,
      cashier_reciept_number: this.CodeFormControl.value,
      // slip_number: +this.cashierOutPut.get('slip_number').value,
      // bank_id: parseInt(this.cashierOutPut.get('bank_id').value),
      date: this.cashierInput.get('date').value,
      slip_date: this.cashierOutPut.get('slip_date').value,
      total_amount: this.cashierOutPut.get('total_amount').value,
      remark: this.remarksFormControl.value,
      payment_type: 1,
      invoices: this.invoiceStempData,
      past_invoices: this.pendingCollection,
      variance: this.cashierOutPut.get('variance').value,
      actual_amount: this.cashierOutPut.get('actual_amount').value,
    };
    // console.log(data)
    this.cashierReceiptService.addCashierReceipt(data).subscribe(
      (result: any) => {
        this.commonToasterService.showSuccess(
          'Cashier Recepit Saved',
          'Cashier Recepit Saved successfully'
        );
        let data = result.data;
        data.edit = false;
        this.close();
      },
      (error) => {
        console.error(error.errors);
      }
    );
  }

  saveStatesCashier(states: any) {
    var data = {
      route_id: this.cashierInput.get('route').value[0].id,
      cashier_reciept_number: this.CodeFormControl.value,
      // slip_number: +this.cashierOutPut.get('slip_number').value,
      // bank_id: parseInt(this.cashierOutPut.get('bank_id').value),
      date: this.cashierInput.get('date').value,
      slip_date: this.cashierOutPut.get('slip_date').value,
      total_amount: this.cashierOutPut.get('total_amount').value,
      actual_amount: this.cashierOutPut.get('actual_amount').value,
      variance: this.cashierOutPut.get('variance').value,
      remark: this.remarksFormControl.value,
      payment_type: 1,
      status: states == 'Verified' ? 0 : 2,
      invoices: this.invoiceStempData,
    };
    this.cashierReceiptService.addCashierReceipt(data).subscribe(
      (result: any) => {
        this.commonToasterService.showSuccess(
          'Cashier Recepit ' + states,
          'Cashier Recepit ' + states + ' successfully.'
        );
        let data = result.data;
        data.edit = false;
        this.close();
      },
      (error) => {
        console.error(error.errors);
      }
    );
  }

  close() {
    this.router.navigate(['finance/cashier-reciept']);
  }
  getCollectionList(data: any) {
    this.apiService.getColleactionList(data).subscribe((res: any) => {
      res.data.credit_note = res.data.credit_note.map((credit: any) => ({
        ...credit,
        type: `Credit Note`,
      }));

      res.data.invoices = res.data.invoices.map((invoice: any) => ({
        ...invoice,
        type: `Invoice`,
      }));
      this.invoices_total = res.data.invoices.length;
      let credit_note_data = res.data.credit_note;
      let invoices_data = res.data.invoices.concat(credit_note_data);
      console.log('credit_note_data', credit_note_data);
      console.log('invoices_data', invoices_data);
      this.collectionDetails = invoices_data;

      this.getCollectionDetails();
    });
  }

  getReceiptList(data: any) {
    this.apiService.getRecieptList(data).subscribe((res: any) => {
      this.recieptData = res.data;
      this.returnsData = res.data.return;
      this.cashierOutPut
        .get('total_amount')
        .setValue(res?.data?.main_total );
        this.CashInvoiceData = res.data.CashInvoiceData;
        this.CollectionData = res.data.CollectionData;
        this.DownpaymentData = res.data.DownpaymentData;
      // console.log(this.recieptData);
    });
  }

  getCollectionDetails() {
    // this.collectionDetails = [];
    this.invoiceStempData = [];
    this.collectionDetails.forEach((element) => {
      if (element.type == 'Invoice') {
        // element.exercise_amount = 1;
        this.invoiceStempData.push({
          invoice_id: element?.id,
          cashier_stamp: 0,
        });
      }
      console.log(this.invoiceStempData);
      // if (element.collectiondetails.length) {
      //   element.collectiondetails.forEach((element1: { collection_number: any; created_at: any; customer: any; }) => {
      //     element1.collection_number = element.collection_number;
      //     element1.created_at = element.created_at;
      //     element1.customer = element.customer;
      //     this.collectionDetails.push(element1);
      //     console.log(this.collectionDetails);

      //   });
      //   this.collectionDetails.map((items:any) => {
      //     this.invoicesData.push({
      //       invoice_id:items?.invoice_id,
      //       cashier_stamp: 0
      //     })
      //   })

      // }
    });
    this.getPremiumData();
    this.getTotalAmount();
  }
  getTotalAmount() {
    var totalAmount = 0;
    this.collectionDetails.forEach((element) => {
      totalAmount += parseFloat(element.amount) || 0;
    });
    // console.log(totalAmount);
    // this.cashierOutPut.get('total_amount').setValue(this.recieptData?.CashAmount);
  }
  onPageFired(data: { [x: string]: number }) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getPremiumData();
  }
  getPremiumData() {
    this.paginateData = this.collectionDetails.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize
    );
  }
  filterListRoute(val: string) {
    this.routeList = this.anotherArray.filter(
      (x: { route_code: string; route_name: string }) =>
        x.route_code.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
        x.route_name.toLowerCase().indexOf(val.toLowerCase()) > -1
    );
  }
  filterListSalesman(val: string) {
    this.salesmanList = this.anotherSalesmanList.filter(
      (x: { user: { firstname: string; lastname: string } }) =>
        x.user.firstname.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
        x.user.lastname.toLowerCase().indexOf(val.toLowerCase()) > -1
    );
  }
  getCollections(id: number) {
    this.cashierReceiptService.getCollectionList(id).subscribe((res: any) => {
      if (res.status) {
        this.collectionDataCash = [...res.data.cash];
        this.collectionDataCheque = [...res.data.cheque];
        this.collectionDataNeft = [...res.data.neft];

      }
    });
  }
  restrictLength(e: {
    target: { value: string | any[] };
    preventDefault: () => void;
  }) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  setUpPayment(type?: number) {
    let payload = {
      payemnt_type: 1,
      total_amount: this.calculatedTotalCash,
      actual_amount: this.actualCashAmountFormControl.value,
      variance: this.varienceCashFormControl.value,
    };
    let payload1 = {
      payemnt_type: 2,
      total_amount: this.calculatedTotalCheque,
      actual_amount: this.actualCheckAmountFormControl.value,
      variance: this.varienceCheckFormControl.value,
    };
    let payload2 = {
      payemnt_type: 3,
      total_amount: this.calculatedTotalNeft,
      actual_amount: this.actualCreditCardAmountFormControl.value,
      variance: this.varienceCreditCardFormControl.value,
    };
    this.cashPaymentPayload = { ...payload };
    this.chequePaymentPayload = { ...payload1 };
    this.neftPaymentPayload = { ...payload2 };

    let totalAmount =
      +this.cashPaymentPayload.total_amount +
      +this.chequePaymentPayload.total_amount +
      +this.neftPaymentPayload.total_amount;

    let cashierPayload: any = {
      route_id: this.routeFormControl.value,
      salesman_id: this.NameFormControl.value,
      slip_number: '',
      bank: '',
      date: this.dateFormControl.value,
      slip_date: '',
      cashier_reciept_number: this.CodeFormControl.value,
      remark: this.remarksFormControl.value,
      total_amount: totalAmount,
      items: [],
    };

    let cashPaymentPayloadArray: any[] = [];
    cashPaymentPayloadArray.push(this.cashPaymentPayload);
    cashPaymentPayloadArray.push(this.chequePaymentPayload);
    cashPaymentPayloadArray.push(this.neftPaymentPayload);

    cashierPayload.items = cashPaymentPayloadArray;
    this.finalCashierPayload = cashierPayload;
    this.currentCashierData.emit(this.finalCashierPayload);

    //this.cashierReceiptService.currentCashierReceiptData(this.finalCashierPayload);
  }
  populateTable() {
    var data = {
      // "salesman_id": this.cashierInput.get('salesman_id').value[0].id,
      payment_type: '1',
      date: this.cashierInput.value.date,
      route_id: this.cashierInput.get('route').value[0].id,
    };

    // console.log('route_id',this.cashierInput);
    var data1 = {
      date: this.cashierInput.value.date,
      route_id: this.cashierInput.get('route').value[0].id,
    };

    var data2 = {
      route_id: this.cashierInput.get('route').value[0].id,
    };
    if (this.cashierInput.value.date) {
      this.cashierOutPut.get('slip_date').patchValue(this.formatDate(new Date()));
    }

    this.openTable = true;
    this.getCollectionList(data);
    this.getReceiptList(data1);
    this.getpendingCollection(data2);
  }
  getOrderCode() {
    let nextNumber = {
      function_for: 'cashier_reciept',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofOrderCode = res.data.number_is;
        this.nextCommingNumberofOrderCodePrefix = res.data.prefix_is;

        if (this.nextCommingNumberofOrderCode) {
          this.CodeFormControl.setValue(this.nextCommingNumberofOrderCode);
          this.CodeFormControl.disable();
        } else if (this.nextCommingNumberofOrderCode == null) {
          this.nextCommingNumberofOrderCode = '';
          this.CodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofOrderCode = '';
        this.CodeFormControl.enable();
      }
    });
  }
  openNumberSettings() {
    let data = {
      title: 'Cashier Receipt Code',
      functionFor: 'cashier_reciept',
      code: this.nextCommingNumberofOrderCode,
      prefix: this.nextCommingNumberofOrderCodePrefix,
      key: this.nextCommingNumberofOrderCode.length ? 'autogenerate' : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.CodeFormControl.setValue('');
          this.nextCommingNumberofOrderCode = '';
          this.CodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.CodeFormControl.setValue(
            res.data.next_coming_number_cashier_reciept
          );
          this.nextCommingNumberofOrderCode =
            res.data.next_coming_number_cashier_reciept;
          this.nextCommingNumberofOrderCodePrefix = res.reqData.prefix_code;
          this.CodeFormControl.disable();
        }
      });
  }

  changeStamps(id: Number, type: any) {
    var tempInvoiceData = this.invoiceStempData;
    this.invoiceStempData = tempInvoiceData.map((i: any) => {
      if (i.invoice_id == id) {
        i.cashier_stamp = Number(type);
      }
      return i;
    });
    const uniqueObjects = [
      ...new Map(
        this.invoiceStempData.map((item: any) => [item.invoice_id, item])
      ).values(),
    ];
    console.log(this.invoiceStempData);
    this.invoiceStempData = uniqueObjects;
  }

  getpendingCollection(modal: any) {
    this.pendingCollection = [];
    this.apiService.getPastInvoice(modal).subscribe((res: any) => {
      res.data?.invoices.map((elements: any) => {
        this.pendingCollection.push({
          amount: 'AED ' + elements?.grand_total,
          customer_code: elements?.customer_info_details?.customer_code,
          customer_name:
            elements?.user?.firstname + ' ' + elements?.user?.lastname,
          route_code: elements?.route?.route_code,
          salesman_code: elements?.salesman_info?.salesman_code,
          salesman_name:
            elements?.salesman_user?.firstname +
            ' ' +
            elements?.salesman_user?.lastname,
          type: elements?.order_type?.name,
          receipt_date: elements?.invoice_date,
          collected_amount:
            elements?.collection?.amount != undefined
              ? 'AED ' + elements?.collection?.amount
              : '',
          remaining_amount: elements?.pending_credit,
          is_stemp: elements.supervisor_stamp, // 0: No   1: Yes
          invoice_id: elements?.id,
          invoice_no: elements?.invoice_number,
          receipt_no: elements?.collection?.collection_number,
        });
        this.invoiceCheckedData.push({
          invoice_id: elements?.id,
          supervisor_stamp:
            elements.supervisor_stamp_date_time == null
              ? elements.stamp
              : elements.supervisor_stamp,
        });
      });
      // this.isCashUpdateChecked = res.data?.is_check;
      this.displayedpendingColumns = this.pendingSalesColumns;
      this.dataPendingSource = new MatTableDataSource<any>(
        this.pendingCollection
      );
    });
  }

  // isAllCashSelected() {
  //   const numSelected = this.pastInvselection.selected.length;
  //   const numRows = this.dataPendingSource.data.length;
  //   return numSelected === numRows;
  // }

  // masterCashToggle() {
  //   if (this.pastInvselection.selected.length == 0) {
  //     this.pastInvselection.clear();
  //     this.dataPendingSource.data.forEach((row: any) => this.pastInvselection.select(row));
  //   } else {
  //     this.commonToasterService.showWarning(
  //       'Warning',
  //       'Before Check All you need to Clear All.'
  //     );
  //   }
  // }

  // clearCashChecks() {
  //   if (this.pastInvselection.selected.length > 0) {
  //     this.pastInvselection.clear();
  //   } else {
  //     this.commonToasterService.showWarning(
  //       'Warning',
  //       'Before Clear All you need to Check All.'
  //     );
  //   }
  // }

  // upadteStamp(invoice_id: any, type: any) {
  //   let obj = {
  //     "invoice_id": invoice_id,
  //     "cashier_stamp": type, // 0=no and 1=yes
  //   }
  //   this.apiService.updateStamp(obj).subscribe((res: any) => {
  //     if (res.status) {
  //       var data2 = {
  //         route_id: this.cashierInput.get('route').value[0].id,
  //       };
  //       this.getpendingCollection(data2)
  //       this.commonToasterService.showSuccess(
  //         'Success',
  //         res.message
  //       );
  //     }
  //   })
  // }

  updateCashCheck(id: any, status: any) {
    const modal = {
      invoice_id: id,
      supervisor_stamp: status,
    };
    console.log('modal>>>>', modal);

    this.apiService.updateSingleInvoice(modal).subscribe((res: any) => {
      if (res.status) {
        var data2 = {
          route_id: this.cashierInput.get('route').value[0].id,
        };
        this.getpendingCollection(data2);
        this.commonToasterService.showSuccess(
          'Success',
          'Cash Collection Update successfully'
        );
        // this.pastInvselection.clear();
      }
    });
  }

  public getPendingDisplayedColumns(): string[] {
    return this.pendingSalesColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }


   formatDate(date:any) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
}

interface CashObject {
  payemnt_type: number;
  total_amount: number;
  actual_amount: number;
  variance: number;
}
export interface PeriodicElement {
  collection: number;
  collection_date: string;
  invoice: number;
  paid: number;
  balance: number;
}

interface CashierDisable {
  NameControl: boolean;
  routeControl: boolean;
  dateControl: boolean;
  CodeControl: boolean;
  varienceCashControl: boolean;
  varienceCheckControl: boolean;
  varienceCreditCardControl: boolean;
  actualCashAmount: boolean;
  actualCheckAmount: boolean;
  actualCreditCardAmount: boolean;
}
