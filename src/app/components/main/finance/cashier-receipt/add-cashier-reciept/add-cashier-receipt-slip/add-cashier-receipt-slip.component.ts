import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CashierReceiptService } from '../../cashier-receipt.service';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-add-cashier-receipt-slip',
  templateUrl: './add-cashier-receipt-slip.component.html',
  styleUrls: ['./add-cashier-receipt-slip.component.scss']
})
export class AddCashierReceiptSlipComponent implements OnInit {
  @Input() isOpenedForDetail: boolean = false;
  @Input() mainFormGroup: FormGroup;
  public receiptFormGroup: FormGroup;
  public populatedata: any;
  public cashamountFormControl: FormControl;
  public checkAmountFormControl: FormControl;
  public totalFormControl: FormControl;
  public slipnoFormControl: FormControl;
  public bankFormControl: FormControl;
  public dateReceiptFormControl: FormControl;
  public cashierReceiptFormData: any;
  public bankList: any[] = [];

  constructor(private cash: CashierReceiptService, private dataEditor: DataEditor) {}

  ngOnInit(): void {
    this.mainFormGroup = new FormGroup({});
    this.dataEditor.newData.subscribe((res: any) => {
      this.populatedata = res;
    });
    if (this.isOpenedForDetail) {
      this.buildForm(true);
    }
    else {
      this.buildForm(false);
    }
    this.getBank();
    this.mainFormGroup.addControl('bank', this.bankFormControl);
    this.mainFormGroup.addControl('slip', this.slipnoFormControl);
    this.mainFormGroup.addControl('date_receipt', this.dateReceiptFormControl);
  }

  getBank() {
    this.cash.getBankDetails().subscribe((res: any) => {
      if (res.status) {
        this.bankList = res.data;
      }
    });
  }

  buildForm(setValidators: boolean) {
    if (!setValidators) {
      this.slipnoFormControl = new FormControl('');
      this.bankFormControl = new FormControl('');
      this.dateReceiptFormControl = new FormControl('');

      this.receiptFormGroup = new FormGroup({
        slip: this.slipnoFormControl,
        bank: this.bankFormControl,
        date_receipt: this.dateReceiptFormControl
      });
    }
    else {
      this.slipnoFormControl = new FormControl('');
      this.bankFormControl = new FormControl('');
      this.dateReceiptFormControl = new FormControl('');

      this.receiptFormGroup = new FormGroup({
        slip: this.slipnoFormControl,
        bank: this.bankFormControl,
        date_receipt: this.dateReceiptFormControl
      });

      this.slipnoFormControl.setValue(this.populatedata?.slip_number);
      this.bankFormControl.setValue(this.populatedata?.bank_id);
      // Date format is 'yyyy-mm-dd'
      this.dateReceiptFormControl.setValue(this.populatedata?.slip_date);

      this.slipnoFormControl.disable();
      this.bankFormControl.disable();
      this.dateReceiptFormControl.disable();
    }
  }

}
