import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PromoMasterComponent } from './promo-master/promo-master.component';


const routes: Routes = [
  {
    path: '',
    component: PromoMasterComponent,

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionalRoutingRoutingModule { }
