import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { OutletProductPageComponent } from './outlet-product-code/outlet-product-page/outlet-product-page.component';
import { CreditLimitComponent } from './credit-limits/credit-limit.component';
 

const routes: Routes = [
  { path: 'outlet-product-code', component: OutletProductPageComponent },
  { path: 'credit-limits', component: CreditLimitComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
