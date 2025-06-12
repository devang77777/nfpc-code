import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SettingRoutingModule } from './setting-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LocationModule } from './location/location.module';
import { ItemModule } from './item/item.module';
import { CustomerModule } from '../master/customer/customer.module';
import { BankDetailComponent } from './Bank/bank-detail/bank-detail.component';
import { AddBankFormComponent } from './Bank/add-bank-form/add-bank-form.component';
import { BankdtComponent } from './Bank/bankdt/bankdt.component';
import { BankmasterComponent } from './Bank/bankmaster/bankmaster.component';
import { CurrencyPageComponent } from './currency/currency-page/currency-page.component';
import { CurrencyDtComponent } from './currency/currency-dt/currency-dt.component';
import { CurrencyFormComponent } from './currency/currency-form/currency-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../../../features/shared/shared.module';
import { SubscriptionWizardComponent } from './subscription/subscription-wizard/subscription-wizard.component';
import { AgmCoreModule } from '@agm/core';
import { OrderService } from '../transaction/orders/order.service';
@NgModule({
  exports: [

    BankDetailComponent,
    AddBankFormComponent,
    BankdtComponent,
    BankmasterComponent,
  ],
  declarations: [

    BankDetailComponent,
    AddBankFormComponent,
    BankdtComponent,
    BankmasterComponent,
    CurrencyPageComponent,
    CurrencyDtComponent,
    CurrencyFormComponent,
    SubscriptionWizardComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    LocationModule,
    ItemModule,
    CustomerModule,
    MaterialImportModule,
    SettingRoutingModule,
    NgSelectModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAq6kI0d8-Y_RxUc0W0NmiTdq6AX9EW_GM',
      libraries: ['places']
    }),
  ],
  providers: [OrderService]
})
export class SettingModule { }
