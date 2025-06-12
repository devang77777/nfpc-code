import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingByTabDetailsComponent } from './pricing-by-tab-details/pricing-by-tab-details.component';
import { PricingByTabDtComponent } from './pricing-by-tab-dt/pricing-by-tab-dt.component';
import { PricingByTabPageComponent } from './pricing-by-tab-page/pricing-by-tab-page.component';
import { PricingByTabRoutingModule } from './pricing-by-tab-routing.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { PricingByTabImportComponent } from './pricing-by-tab-import/pricing-by-tab-import.component';
import { PricingExportComponent } from './pricing-export/pricing-export.component';
import { PricingByItemBaseTabImportComponent } from './pricing-by-item-base-tab-import/pricing-by-item-base-tab-import.component';
import { CustomerPricingExportComponent } from './customer-pricing-export/customer-pricing-export.component';
import { ActiveCustomerPricingExportComponent } from './active-customer-pricing-export/active-customer-pricing-export.component';
import { CopyPricingComponent } from './copy-pricing/copy-pricing.component';



@NgModule({
  declarations: [PricingByTabPageComponent, PricingByTabDtComponent, PricingByTabDetailsComponent, PricingByTabImportComponent, PricingExportComponent, PricingByItemBaseTabImportComponent, CustomerPricingExportComponent, ActiveCustomerPricingExportComponent, CopyPricingComponent],

  imports: [
    CommonModule,
    PricingByTabRoutingModule,
    MaterialImportModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PricingByTabModule { }
