import { FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CashierReceiptService } from '../cashier-receipt.service';

@Component({
  selector: 'app-add-cashier-reciept',
  templateUrl: './add-cashier-reciept.component.html',
  styleUrls: ['./add-cashier-reciept.component.scss']
})
export class AddCashierRecieptComponent implements OnInit {
  public isValidOverviewFormCheck: boolean = false;
  public formType: string;
  private fds: FormDrawerService;
  public parentFormGroup: FormGroup
  private apiService: ApiService;
  public cashierReceiptFormData: any
  public buttonTitle: string;
  public isAddForm: boolean = false;
  private dataEditor: DataEditor;
  public nextTabEnable: boolean = true;
  public cashierReceiptOverviewData: any[] = [];
  public currentIndex: number = 0;
  private subscriptions: Subscription[] = [];
  depots: any;
  public recalculateReceipt: boolean = false;
  public isLinear: boolean = true;

  constructor(fds: FormDrawerService, apiService: ApiService,
    private cash: CashierReceiptService,
    dataEditor: DataEditor, public dialog: MatDialog,
    private router: Router) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.isAddForm = this.router.url.includes('finance/cashier-reciept/add');
    this.formType = this.isAddForm ? 'Add' : '';
    this.parentFormGroup = new FormGroup({});
    if (this.currentIndex) {
      this.buttonTitle = 'Save'
    }
    else {
      this.buttonTitle = 'Next'
    }
  }

  validFormCheck(check: any) {
    if (check) {
      this.isValidOverviewFormCheck = true;
    }
    else {
      this.isValidOverviewFormCheck = false;
    }
  }

  saveCashier() {
    if (this.currentIndex) {
      //this.close();
      let key = this.parentFormGroup.get('bank').value
      //console.log('bank', key)
      //console.log(this.cashierReceiptOverviewData)
      this.cashierReceiptOverviewData['bank_id'] = key.bank
      this.cashierReceiptOverviewData['slip_date'] = key.date_receipt
      this.cashierReceiptOverviewData['slip_number'] = key.slip
      this.cash.addCashierReceipt(this.cashierReceiptOverviewData).subscribe((res: any) => {
        if (res.status) {
          this.close();
        }
      })
    }
    else {
      this.currentIndex++;
      this.buttonTitle = 'Save'
      this.nextTabEnable = false;
      this.recalculateReceipt = true;
      this.cash.cashierChanges(true);
      //this.cash.currentCashierReceiptData(this.cashierReceiptOverviewData);
    }
  }

  cashierReceiptData(event: any) {

    if (event) {
      this.cashierReceiptOverviewData = event;
    }
  }

  public close() {
    this.router.navigate(['finance/cashier-reciept']);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
