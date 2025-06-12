import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { PricingByTabPageComponent } from './pricing-by-tab-page/pricing-by-tab-page.component';
import { PricingByTabImportComponent } from './pricing-by-tab-import/pricing-by-tab-import.component';
import { PricingByItemBaseTabImportComponent } from './pricing-by-item-base-tab-import/pricing-by-item-base-tab-import.component';
import { ActiveCustomerPricingExportComponent } from './active-customer-pricing-export/active-customer-pricing-export.component';
import { CopyPricingComponent } from './copy-pricing/copy-pricing.component';


const routes: Routes = [
  {
    path: '',
    component: PricingByTabPageComponent,
  },
  {
    path: 'import',
    component: PricingByTabImportComponent,
  },
  {
    path: 'item-import',
    component: PricingByItemBaseTabImportComponent,
  },
  {
    path: 'active-customer-import',
    component: ActiveCustomerPricingExportComponent,
  },
  {
    path: 'copy-pricing',
    component: CopyPricingComponent,
  },

];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PricingByTabRoutingModule { }
