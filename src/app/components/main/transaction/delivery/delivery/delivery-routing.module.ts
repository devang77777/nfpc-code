import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';
import { DeliveryBaseComponent } from './delivery-base/delivery-base.component';
import { DeliveryViewResolveService } from './resolvers/delivery-view-resolve.service';
import { DeliveryResolveService } from './resolvers/delivery-resolve.service';
import { DeliveryFormComponent } from './delivery-form/delivery-form.component';
import { DeliveryImportComponent } from './delivery-import/delivery-import.component';
import { DeliveryUpdateComponent } from './delivery-update/delivery-update.component';

const routes: Routes = [
  {
    path: '',
    component: DeliveryBaseComponent
  },
  {
    path: 'add',
    resolve: {
      resolved: DeliveryResolveService
    },
    component: DeliveryFormComponent
  },
  {
    path: 'edit',
    redirectTo: ''
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved: DeliveryResolveService,
      delivery: DeliveryViewResolveService
    },
    component: DeliveryFormComponent
  },
  { path: 'import', component: DeliveryImportComponent },
  { path: 'update', component: DeliveryUpdateComponent }

];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DeliveryRoutingModule { }
