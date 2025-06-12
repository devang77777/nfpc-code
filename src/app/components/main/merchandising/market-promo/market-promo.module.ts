import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';
import { MarketPromoRoutingModule } from './market-promo-routing.module';
import { MarketPromoMasterComponent } from './market-promo-master/market-promo-master.component';
import { MarketPromoDtComponent } from './market-promo-dt/market-promo-dt.component';


@NgModule({
  declarations: [MarketPromoMasterComponent, MarketPromoDtComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    MaterialImportModule,
    LightboxModule,
    MarketPromoRoutingModule
  ]
})
export class MarketPromoModule { }
