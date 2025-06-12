import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaxRoutingModule } from './tax-routing.module';
import { TaxMasterComponent } from './tax-master/tax-master.component';
import { TaxRatesComponent } from './tax-rates/tax-rates.component';
import { TaxRatesDtComponent } from './tax-rates-dt/tax-rates-dt.component';
import { AddTaxRatesComponent } from './add-tax-rates/add-tax-rates.component';
import { TaxSettingsComponent } from './tax-settings/tax-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { LightboxModule } from 'ngx-lightbox';
import { GstSettingsComponent } from './gst-settings/gst-settings.component';


@NgModule({
  declarations: [TaxMasterComponent, TaxRatesComponent, TaxRatesDtComponent, AddTaxRatesComponent, TaxSettingsComponent, GstSettingsComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    TaxRoutingModule,
    LightboxModule,
  ]
})
export class TaxModule { }
