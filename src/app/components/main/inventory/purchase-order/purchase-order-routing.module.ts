import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseOrderBaseComponent } from './purchase-order-base/purchase-order-base.component';
import { PurchaseOrderResolveService } from './resolvers/purchase-order-resolve.service';
import { PurchaseOrderViewResolveService } from './resolvers/purchase-order-view-resolve.service';
import { PurchaseOrderDetailComponent } from './purchase-order-detail/purchase-order-detail.component';
import { PurchaseOrderFormComponent } from './purchase-order-form/purchase-order-form.component';

const routes: Routes = [
  {
    path: '',
    component: PurchaseOrderBaseComponent,
    resolve: {
      resolved: PurchaseOrderResolveService,
    },
  },

  {
    path: 'add',
    resolve: {
      resolved: PurchaseOrderResolveService,
    },
    component: PurchaseOrderFormComponent,
  },
  {
    path: 'edit',
    redirectTo: '',
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved: PurchaseOrderResolveService,
      purchase_order: PurchaseOrderViewResolveService,
    },
    component: PurchaseOrderFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseOrderRoutingModule {}
