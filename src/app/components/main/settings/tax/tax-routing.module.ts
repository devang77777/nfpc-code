import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaxMasterComponent } from './tax-master/tax-master.component';
import { TaxSettingsComponent } from './tax-settings/tax-settings.component';
import { TaxRatesComponent } from './tax-rates/tax-rates.component';
import { GstSettingsComponent } from './gst-settings/gst-settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'tax-rates', pathMatch: 'full' },
  {
    path: '',
    component: TaxMasterComponent,
    children: [
      { path: 'tax-rates', component: TaxRatesComponent },
      { path: 'tax-settings', component: TaxSettingsComponent },
      { path: 'gst-settings', component: GstSettingsComponent },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxRoutingModule { }
