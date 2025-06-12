import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Component, ElementRef, OnDestroy, OnInit, Input, SimpleChanges } from '@angular/core';
import { InfoModal } from '../../collection/collection-models';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { InvoiceServices } from '../invoice.service';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-invoice-collection',
  templateUrl: './invoice-collection.component.html',
  styleUrls: ['./invoice-collection.component.scss']
})

export class InvoiceCollectionComponent implements OnInit, OnDestroy {
  @Input() public invoiceData: any;
  public uuid: string;
  public invoiceitemObject: any;
  public currentDate: any;
  public finalInvoicpayload = {};
  public nextCommingNumberofCollectionCode: string = '';
  public payModes: InfoModal[] = [
    { id: 2, name: "Check" },
    { id: 1, name: "Cash" },
    { id: 3, name: "Advance Payment" }
  ];
  public todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  public collectionForm: FormGroup;
  public modeFormControl: FormControl;
  public numberFormControl: FormControl;
  public dateFormControl: FormControl;
  public amountFormControl: FormControl;
  public chequedateFormControl: FormControl;
  public chequenumberFormControl: FormControl;
  public bankFormControl: FormControl;

  private router: Router;
  private fds: FormDrawerService;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  public bankList: any[] = [];
  nextCommingNumberofCollectionCodePrefix: any;

  constructor(
    private invoiceServices: InvoiceServices,
    private datePipe: DatePipe,
    fds: FormDrawerService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    private ctc: CommonToasterService,
    router: Router,
    route: ActivatedRoute) {
    Object.assign(this, { fds, dataService, dialogRef, elemRef, formBuilder, router, route });
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

    this.uuid = this.route.snapshot.params.uuid;
    this.buildForm();
    this.getOrderCode();
    this.invoiceServices.getBankList().subscribe((res: any) => {
      this.bankList = res.data;
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    this.ngOnInit();
  }
  buildForm() {
    console.log(this.invoiceData)
    this.numberFormControl = this.formBuilder.control('', Validators.required);
    this.dateFormControl = this.formBuilder.control(this.currentDate, Validators.required);
    this.amountFormControl = this.formBuilder.control(+this.invoiceData.pending_credit, [Validators.required, Validators.max(+this.invoiceData.pending_credit)]);
    this.modeFormControl = this.formBuilder.control(1, Validators.required);
    this.chequedateFormControl = this.formBuilder.control('', Validators.required);
    this.chequenumberFormControl = this.formBuilder.control('', Validators.required);
    this.bankFormControl = this.formBuilder.control('', Validators.required);

    this.collectionForm = this.formBuilder.group({
      payemnt_type: this.modeFormControl,
      collection_number: this.numberFormControl,
      collection_date: this.dateFormControl,
      invoice_amount: this.amountFormControl,
      cheque_number: this.chequenumberFormControl,
      cheque_date: this.chequedateFormControl,
      bank_info: this.bankFormControl
    });
  }

  getOrderCode() {
    let nextNumber = {
      "function_for": "collection"
    }
    this.invoiceServices.nexCommingNumber(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofCollectionCode = res.data.number_is;
        this.nextCommingNumberofCollectionCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofCollectionCode) {
          this.numberFormControl.setValue(this.nextCommingNumberofCollectionCode);
        }
        else if (this.nextCommingNumberofCollectionCode == null) {
          this.nextCommingNumberofCollectionCode = '';
          this.numberFormControl.setValue('');
        }
      }
      else {
        this.nextCommingNumberofCollectionCode = '';
        this.numberFormControl.setValue('');
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Order Code',
      functionFor: 'collection',
      code: this.nextCommingNumberofCollectionCode,
      prefix: this.nextCommingNumberofCollectionCodePrefix,
      key: this.nextCommingNumberofCollectionCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialogRef.open(CodeDialogComponent, {
      width: '500px',
      data: data
    }).componentInstance.sendResponse.subscribe((res: any) => {
      if (res.type == 'manual' && res.enableButton) {
        this.numberFormControl.setValue('');
        this.nextCommingNumberofCollectionCode = '';
      } else if (res.type == 'autogenerate' && !res.enableButton) {
        this.numberFormControl.setValue(res.data.next_coming_number_invoice);
        this.nextCommingNumberofCollectionCode = res.data.next_coming_number_collection;
        this.nextCommingNumberofCollectionCodePrefix = res.reqData.prefix_code;
      }
    });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public checkFormValidation(): boolean {
    if (this.amountFormControl.invalid) {
      this.ctc.showWarning("Invalid!!!", "Please enter correct amount");
      return false;
    }
    else if (this.numberFormControl.invalid) {
      this.ctc.showWarning("Invalid!!!", "Please enter correct invoice number");
      return false;
    }
    else if (this.dateFormControl.invalid) {
      this.ctc.showWarning("Invalid!!!", "Please enter correct collection date");
      return false;
    }
    else if (this.modeFormControl.invalid) {
      this.ctc.showWarning("Invalid!!!", "Please select correct collection type");
      return false;
    }

    if (this.modeFormControl.value == 2) {
      if (this.chequedateFormControl.invalid) {
        this.ctc.showWarning("Invalid!!!", "Please enter correct check date");
        return false;
      }
      else if (this.chequenumberFormControl.invalid) {
        this.ctc.showWarning("Invalid!!!", "Please enter correct check number");
        return false;
      }
      else if (this.bankFormControl.invalid) {
        this.ctc.showWarning("Invalid!!!", "Please enter correct bank");
        return false;
      }
      return true;
    }
    return true;
  }

  public saveCollection(): void {
    let modeType = 1;
    let modeFormControl = this.modeFormControl.value;
    if (modeFormControl == 0) {
      modeType = 2;
    };

    if (!this.checkFormValidation()) {
      return;
    }

    const itemPayload = {
      "invoice_id": this.invoiceData.id,
      "amount": this.amountFormControl.value,
      "allocate_amount": this.amountFormControl.value,
      "cleared_amount": this.amountFormControl.value,
      "customer_id": this.invoiceData.customer_id,
      "type": modeType,
      "collection_type": modeType
    };

    this.invoiceitemObject = { ...itemPayload }

    const finalPayload = {
      "customer_id": this.invoiceData.user?.id,
      "salesman_id": this.invoiceData?.salesman_id || "",
      "collection_type": this.modeFormControl.value,
      "lob_id": this.invoiceData.lob_id,
      "source": 3,
      "transaction_number": "",
      "status": 1,
      "items": [],
      "allocate_amount": this.amountFormControl.value,
      "shelf_rent": 0,
      "current_stage": "pending",
      ...this.collectionForm.value
    };

    let cashPaymentPayloadArray: any[] = [];
    cashPaymentPayloadArray.push(this.invoiceitemObject);
    finalPayload.items = cashPaymentPayloadArray;
    this.finalInvoicpayload = finalPayload;

    this.postCollection();
    this.fds.close();
  }

  public closeForm(): void {
    this.fds.close().then(() => {
      this.fds.setFormName('');
    });
  }

  public postCollection() {
    this.invoiceServices.addCollection(this.finalInvoicpayload).subscribe((res: any) => {
      if (res.status) {
        this.ctc.showSuccess("Colection Added", "YOur Payment has been recorded")
      }
    });
  }
}
