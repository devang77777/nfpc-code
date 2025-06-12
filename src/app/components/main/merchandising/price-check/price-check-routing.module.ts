import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceCheckComponent } from './views/price-check/price-check.component';


const routes: Routes = [
  {
    path: '',
    component: PriceCheckComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceCheckRoutingModule { }
