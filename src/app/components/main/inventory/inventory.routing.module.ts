import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'purchase-order', pathMatch: 'full' },
  {
    path: 'purchase-order',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./purchase-order/purchase-order.module').then(
        (module) => module.PurchaseOrderModule
      ),
  },
  {
    path: 'depot-expairy',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./Depot Expairy Goods/depot.module').then(
        (module) => module.DepotExpairyModule
      ),
  },
  {
    path: 'grn',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./goods-receipt-notes/grn.module').then(
        (module) => module.GrnModule
      ),
  },
  {
    path: 'stock-adjustment',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./stock-adjustment/stock-adjustment.module').then(
        (module) => module.StockAdjustmentModule
      ),
  },

];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class InventoryRoutingModule { }
