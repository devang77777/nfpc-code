import { NgModule } from '@angular/core';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CashierReceiptRoutingModule } from './cashier-reciept-routing.module';
import { CashierReceiptService } from './cashier-receipt.service';
import { CashierRecieptMasterPageComponent } from './cashier-reciept-master-page/cashier-reciept-master-page.component';
import { CashierRecieptDtComponent } from './cashier-reciept-dt/cashier-reciept-dt.component';
import { CashierReceiptDetailPageComponent } from './cashier-receipt-detail-page/cashier-receipt-detail-page.component';
import { AddCashierRecieptComponent } from './add-cashier-reciept/add-cashier-reciept.component';
import { AddCashierReceiptSlipComponent } from './add-cashier-reciept/add-cashier-receipt-slip/add-cashier-receipt-slip.component';
import { AddCashierReceiptOverviewComponent } from './add-cashier-reciept/add-cashier-receipt-overview/add-cashier-receipt-overview.component';
import { SharedModule } from '../../../../features/shared/shared.module';

@NgModule({
  declarations: [
    CashierRecieptMasterPageComponent,
    CashierRecieptDtComponent,
    CashierReceiptDetailPageComponent,
    AddCashierRecieptComponent,
    AddCashierReceiptSlipComponent,
    AddCashierReceiptOverviewComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    CashierReceiptRoutingModule,
    SharedModule,
  ],
  providers: [CashierReceiptService],
})
export class CashierReceiptModule {}
