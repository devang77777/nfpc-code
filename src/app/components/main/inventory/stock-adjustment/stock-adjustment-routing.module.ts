import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SaBaseComponent} from './sa-base/sa-base.component';
import {SaDetailComponent} from './sa-detail/sa-detail.component';
import {StockAdjustmentResolveService} from './resolvers/stock-adjustment-resolve.service';
import {SaFormComponent} from './sa-form/sa-form.component';
import {StockAdjustmentViewResolveService} from './resolvers/stock-adjustment-view-resolve.service';

const routes: Routes = [
  {
    path: '',
    component: SaBaseComponent,
    resolve: {
      resolved: StockAdjustmentResolveService
    },
  },
  {
    path: 'detail',
    redirectTo: ''
  },
  {
    path: 'detail/:uuid',
    resolve: {
      stock: StockAdjustmentViewResolveService
    },
    component: SaDetailComponent
  },
  {
    path: 'add',
    resolve: {
      resolved: StockAdjustmentResolveService,

    },
    component: SaFormComponent
  },
  {
    path: 'edit',
    redirectTo: ''
  },
  {
    path: 'edit/:uuid',
    resolve: {
      stock: StockAdjustmentViewResolveService,
      resolved: StockAdjustmentResolveService
    },
    component: SaFormComponent
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
export class StockAdjustmentRoutingModule { }

