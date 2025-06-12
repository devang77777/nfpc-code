import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AddCashierRecieptComponent } from './add-cashier-reciept/add-cashier-reciept.component';
import { CashierReceiptDetailPageComponent } from './cashier-receipt-detail-page/cashier-receipt-detail-page.component';
import { CashierRecieptMasterPageComponent } from './cashier-reciept-master-page/cashier-reciept-master-page.component';

const routes: Routes = [
    { path: '', component: CashierRecieptMasterPageComponent },
    { path: 'add', component: AddCashierRecieptComponent },
    { path: 'detail-page', redirectTo: '' },
    { path: 'detail-page/:uuid', component: CashierReceiptDetailPageComponent },
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CashierReceiptRoutingModule {}