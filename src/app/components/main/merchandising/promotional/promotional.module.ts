import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from '../../../../imports/material-import/material-import.module';
import { LightboxModule } from 'ngx-lightbox';
import { PromoMasterComponent } from './promo-master/promo-master.component';
import { PromoDtComponent } from './promo-dt/promo-dt.component';
import { PromoDetailComponent } from './promo-detail/promo-detail.component';
import { AddPromoComponent } from './add-promo/add-promo.component';
import { PromotionalRoutingRoutingModule } from './promotional-routing-routing.module';
import { ViewPostListComponent } from './promo-detail/view-post-list/view-post-list.component';


@NgModule({
  declarations: [
    PromoMasterComponent,
    PromoDtComponent,
    PromoDetailComponent,
    AddPromoComponent,
    ViewPostListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    LightboxModule,
    MaterialImportModule,
    PromotionalRoutingRoutingModule
  ]
})
export class PromotionalModule { }
