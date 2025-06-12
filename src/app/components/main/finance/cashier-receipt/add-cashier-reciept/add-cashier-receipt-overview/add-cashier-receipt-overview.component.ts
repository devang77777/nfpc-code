import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CashierReceiptService } from '../../cashier-receipt.service';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';

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
  public cashFormGroup: FormGroup;
  public receiptFormGroup: FormGroup;
  public NameFormControl: FormControl;
  public routeFormControl: FormControl;
  public amountFormControl: FormControl;
  public CodeFormControl: FormControl;
  public dateFormControl: FormControl;
  public totalCash: number = 2500;
  public formChangeArray: any[] = [];
  public calculatedTotalCash: number = 0;
  public calculatedTotalCheque: number = 0;
  public calculatedTotalNeft: number = 0;
  public opencashiertable: boolean = false;
  public varienceCashFormControl: FormControl;
  public varienceCheckFormControl: FormControl;
  public varienceCreditCardFormControl: FormControl;
  public varienceFormGroup: FormGroup;
  public collectionDataCash: any[] = [];
  public collectionDataCheque: any[] = [];
  public collectionDataNeft: any[] = [];
  public actualCashAmountFormControl: FormControl;
  public actualCheckAmountFormControl: FormControl;
  public actualCreditCardAmountFormControl: FormControl;
  public actualAmountFormGroup: FormGroup;
  public cashierReceiptData: any;
  public cashPaymentPayload: CashObject;
  public chequePaymentPayload: CashObject;
  public neftPaymentPayload: CashObject;
  public openchecktable: boolean = false;
  public openCreditCardTable: boolean = false;
  public nextCommingNumberofOrderCode: string;
  public finalCashierPayload = {};
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

  public hiddenAutoGenerateIcon: boolean = false;
  public formType: string = '';
  public routeList: any[] = [];
  public salesmanList: any[] = [];
  public isAddForm: boolean = false;
  public disableCondition: CashierDisable = {
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
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  recalculateReceit: boolean = false;
  nextCommingNumberofOrderCodePrefix: any;
  constructor(
    private cashierReceiptService: CashierReceiptService,
    fds: FormDrawerService,
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

    if (this.isOpenedForDetail) {
      this.buildForm(true);
    } else {
      this.buildForm(false);
    }
    this.buildVarienceForm();
    this.buildActualAmountForm();

    this.cashierReceiptService.getRoute().subscribe((res: any) => {
      if (res.status) {
        this.routeList = res.data;
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

  ngOnChanges(changes: SimpleChanges) {
    //console.log(changes);
  }

  buildForm(setValidators: boolean) {
    if (!setValidators) {
      this.NameFormControl = new FormControl('', [Validators.required]);
      this.routeFormControl = new FormControl('', [Validators.required]);
      this.dateFormControl = new FormControl('', [Validators.required]);
      this.CodeFormControl = new FormControl('', [Validators.required]);
      this.cashFormGroup = new FormGroup({
        route: this.routeFormControl,
        name: this.NameFormControl,
        date: this.dateFormControl,
        code: this.CodeFormControl,
      });

      this.disableCondition.NameControl = true;
      this.disableCondition.dateControl = true;
    } else {
      this.NameFormControl = new FormControl('');
      this.routeFormControl = new FormControl('');
      this.dateFormControl = new FormControl('');
      this.CodeFormControl = new FormControl('');

      this.cashFormGroup = new FormGroup({
        route: this.routeFormControl,
        name: this.NameFormControl,
        date: this.dateFormControl,
        code: this.CodeFormControl,
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

    if (
      this.cashierReceiptData.cashierrecieptdetail &&
      this.cashierReceiptData.cashierrecieptdetail.length
    ) {
      this.cashierReceiptData.cashierrecieptdetail.forEach((item, i) => {
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
          this.actualCreditCardAmountFormControl.setValue(+item.actual_amount);
          this.varienceCreditCardFormControl.setValue(+item.variance);
          this.calculatedTotalNeft = +item.total_amount;
        }
      });
    }

    Object.keys(this.disableCondition).forEach((item, i) => {
      this.disableCondition[item] = true;
    });
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
    this.collectionDataCash[0].collectiondetails.forEach((item, i) => {
      totalcash += +item.amount;
    });
    this.calculatedTotalCash = totalcash;
    this.varienceCashFormControl.setValue(this.calculatedTotalCash);
  }

  calculateTotalCheque() {
    let totalcash: number = 0;
    this.collectionDataCheque[0].collectiondetails.forEach((item, i) => {
      totalcash += +item.amount;
    });
    this.calculatedTotalCheque = totalcash;
    this.varienceCheckFormControl.setValue(this.calculatedTotalCheque);
  }

  calculatedTotaneft() {
    let totalcash: number = 0;
    this.collectionDataCheque[0].collectiondetails.forEach((item, i) => {
      totalcash += +item.amount;
    });
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
      }
    });
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
  restrictLength(e) {
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

    let cashierPayload = {
      route_id: this.routeFormControl.value,
      salesman_id: this.NameFormControl.value,
      slip_number: '',
      bank: '',
      date: this.dateFormControl.value,
      slip_date: '',
      cashier_reciept_number: this.CodeFormControl.value,
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
