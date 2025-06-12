import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'order', pathMatch: 'full' },
  {
    path: 'order',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./orders/orders.module').then(
        (module) => module.OrdersModule
      )
  },
  {
    path: 'delivery',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./delivery/delivery.module').then(
        (module) => module.DeliveryModule
      )
  },
  {
    path: 'invoice',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./invoice/invoice.module').then(
        (module) => module.InvoiceModule
      )
  },
  {
    path: 'credit-note',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./credit-note/credit-note.module').then(
        (module) => module.CreditNoteModule
      )
  },
  {
    path: 'debit-note',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./debit-note/debit-note.module').then(
        (module) => module.DebitNoteModule
      )
  },
  {
    path: 'collection',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./collection/collection.module').then(
        (module) => module.CollectionModule
      )
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class TransactionRoutingModule { }
