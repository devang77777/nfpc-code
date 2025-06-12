import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: 'cashier-reciept',
        loadChildren: () =>
          import('./cashier-receipt/cashier-reciept.module')
          .then((module) => module.CashierReceiptModule
        ),
    }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FinanceRoutingModule {}