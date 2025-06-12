import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { BankmasterComponent } from './Bank/bankmaster/bankmaster.component';
import { CurrencyPageComponent } from './currency/currency-page/currency-page.component';
import { SubscriptionWizardComponent } from './subscription/subscription-wizard/subscription-wizard.component';

const routes: Routes = [
  { path: '', redirectTo: 'location', pathMatch: 'full' },
  {
    path: 'location',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./location/location.module').then(
        (module) => module.LocationModule
      ),
  },
  {
    path: 'reason',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./reason/reason.module').then((module) => module.ReasonModule),
  },
  {
    path: 'driver-replacement',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./driver-replacement/driver-replacement.module').then((module) => module.DriverReplacementModule),
  },
  {
    path: 'merchandising-replace',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./merchandising-replace/merchandising-replace.module').then((module) => module.MerchandisingReplaceModule),
  },
  {
    path: 'customer',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer/customer.module').then(
        (module) => module.CustomerModule
      ),
  },
  {
    path: 'item',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./item/item.module').then((module) => module.ItemModule),
  },
  {
    path: 'preference',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./preferences/preferences.module').then(
        (module) => module.PreferencesModule
      ),
  },
  {
    path: 'warehouse',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./warehouse/warehouse.module').then((module) => module.WarehouseModule),
  },
    { path: 'bank', component: BankmasterComponent },
  { path: 'currency', component: CurrencyPageComponent },
  { path: 'subscriptions', component: SubscriptionWizardComponent },
  {
    path: 'tax',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./tax/tax.module').then((module) => module.TaxModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRoutingModule { }
