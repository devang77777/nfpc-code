import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PricingPageComponent } from './pricing-page/pricing-page.component';
import { PricingDetailComponent } from './pricing-detail/pricing-detail.component';
import { PricingDtComponent } from './pricing-dt/pricing-dt.component';
import { PricingRoutingModule } from './pricing-routing.module';
import { PricingFormComponent } from './pricing-form/pricing-form.component';
import { PricingFormKeyCombinationComponent } from './pricing-form/pricing-form-key-combination/pricing-form-key-combination.component';
import { PricingFormKeyValueComponent } from './pricing-form/pricing-form-key-value/pricing-form-key-value.component';
import { PricingFormItemsComponent } from './pricing-form/pricing-form-items/pricing-form-items.component';
import { PricingDetailDtComponent } from './pricing-detail/pricing-detail-dt/pricing-detail-dt.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { PricingExportComponent } from './pricing-export/pricing-export.component';
import { PricingImportComponent } from './pricing-import/pricing-import.component';



@NgModule({
  declarations: [
    PricingPageComponent,
    PricingDetailComponent,
    PricingDtComponent,
    PricingFormComponent,
    PricingFormKeyCombinationComponent,
    PricingFormKeyValueComponent,
    PricingFormItemsComponent,
    PricingDetailDtComponent,
    PricingExportComponent,
    PricingImportComponent
  ],
  imports: [
    CommonModule,
    PricingRoutingModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PricingModule { }
