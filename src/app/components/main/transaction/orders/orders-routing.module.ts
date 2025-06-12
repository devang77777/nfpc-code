import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderBaseComponent } from './order-base/order-base.component';
import { OrderViewResolveService } from './resolvers/order-view-resolve.service';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderResolveService } from './resolvers/order-resolve.service';
import { OrderFormComponent } from './order-form/order-form.component';
import { ConvertToDeliveryComponent } from './convert-to-delivery/convert-to-delivery.component';
import { OrderViewDetailResolveService } from './resolvers/order-view-detail-resolver.service';
import { OrderImportComponent } from './order-import/order-import.component';
import { OrderUpdateComponent } from './order-update/order-update.component';
import { OcrReadPdfComponent } from './ocr-read-pdf/ocr-read-pdf.component';
import { OrderViewComponent } from './order-view/order-view.component';

const routes: Routes = [
  {
    path: '',
    component: OrderBaseComponent
  },
  // {
  //   path: 'detail/:uuid',
  //   resolve: {
  //     order: OrderViewDetailResolveService
  //   },
  //   component: OrderDetailComponent
  // },
  {
    path: 'add',
    // resolve: {
    //   resolved: OrderResolveService
    // },
    component: OrderFormComponent
  },
  {
    path: 'edit',
    redirectTo: ''
  },
  {
    path: 'edit/:uuid',
    resolve: {
      // resolved: OrderResolveService,
      order: OrderViewResolveService
    },
    component: OrderFormComponent
  },
  {
    path: 'start-delivery/:uuid',
    resolve: {
      order: OrderViewDetailResolveService,
      itemsorder: OrderViewResolveService,
      convert: OrderResolveService
    },
    component: ConvertToDeliveryComponent
  },
  { path: 'import', component: OrderImportComponent },
  { path: 'update', component: OrderUpdateComponent },
  { path: 'pdf-ocr-read', component: OcrReadPdfComponent },
  { path: 'view', component: OrderViewComponent },

];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class OrdersRoutingModule { }
