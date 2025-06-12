import { EstimateViewResolveService } from './estimate-view-resolve.service';

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { EstimatemasterComponent } from './estimatemaster/estimatemaster.component';
import { AddEstimateComponent } from './add-estimate/add-estimate.component';
import { EstimatedetailComponent } from './estimatedetail/estimatedetail.component';
import { EstimateResolveService } from './estimate-resolve.service';

const routes: Routes = [
  {
    path: '',
    component:EstimatemasterComponent,
    resolve:{
      resolved:EstimateResolveService
    },

  },
  {
    path: 'add',
    component: AddEstimateComponent,
    resolve:{
      resolved:EstimateResolveService
    },
  },

  {
    path: 'detail',
    redirectTo: ''
  },
  {
    path: 'detail/:uuid',
    resolve: {
      purchase_order: EstimateViewResolveService
    },
    component: EstimatedetailComponent
  },
  {
    path: 'edit',
    redirectTo: ''
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved:EstimateResolveService ,
      purchase_order: EstimateViewResolveService
    },
    component: AddEstimateComponent
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
export class EstimateRoutingModule { }
