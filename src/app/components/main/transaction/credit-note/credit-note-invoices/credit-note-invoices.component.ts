import { ApiService } from './../../../../../services/api.service';
import { CreditNoteService } from './../credit-note.service';
import { ValidatorService } from './../../../../../services/validator.service';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
@Component({
  selector: 'app-credit-note-invoices',
  templateUrl: './credit-note-invoices.component.html',
  styleUrls: ['./credit-note-invoices.component.scss'],
})
export class CreditNoteInvoicesComponent implements OnInit {
  invoiceForm: FormGroup;
  invoices: any[];
  amountToCredit: number = 0;
  remainingCredit: number = 0;
  creditNoteData: any;
  private creditNoteService: CreditNoteService;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  private toaster: CommonToasterService;
  constructor(
    public apiService: ApiService,
    creditNoteService: CreditNoteService,
    toaster: CommonToasterService,
    @Inject(MAT_DIALOG_DATA) public invoiceData: any,
    public dialog: MatDialogRef<CreditNoteInvoicesComponent>
  ) {
    Object.assign(this, {
      creditNoteService,
      toaster,
    });
  }

  ngOnInit(): void {
    this.invoices = this.invoiceData.invoices.data;
    this.creditNoteData = this.invoiceData.creditNoteData;
    this.invoiceForm = new FormGroup({
      invoices: new FormArray([]),
    });
    this.remainingCredit = this.creditNoteData.grand_total;

    const formArray = this.invoiceForm.controls.invoices as FormArray;
    this.invoices.forEach((data) => {
      formArray.push(
        new FormControl(0, [
          ValidatorService.numbersOnly,
          Validators.min(0),
          Validators.max(Number(data.pending_amount)),
        ])
      );
    });
  }
  get invoicesFormArray() {
    return this.invoiceForm.controls.invoices as FormArray;
  }
  submit() {
    const mappedInvoices = this.invoiceForm.value.invoices.map((value, i) => {
      const invoice = this.invoices[i];
      return {
        invoice_id: invoice.id,
        balance: invoice.pending_amount,
        amount: value,
        source: 2,
      };
    });
    const model = {
      credit_note_number: this.creditNoteData.credit_note_number,
      items: mappedInvoices,
    };
    this.creditNoteService.applyCreditSave(model).subscribe((result) => {
      this.toaster.showSuccess('Success', 'Invoice applied successfuly.');
      this.dialog.close();
    });
  }
  onChange() {
    const formArray = this.invoiceForm.controls['invoices'] as FormArray;
    let total = 0;
    formArray.controls.forEach((item) => {
      total = total + Number(item.value);
    });
    this.amountToCredit = total;
    this.remainingCredit = Number(this.creditNoteData.grand_total) - total;
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
