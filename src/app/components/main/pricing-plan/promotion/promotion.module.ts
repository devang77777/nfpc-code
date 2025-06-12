import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionRoutingModule } from './promotion-routing.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromotionPageComponent } from './promotion-page/promotion-page.component';
import { PromotionDetailComponent } from './promotion-detail/promotion-detail.component';
import { PromotionDtComponent } from './promotion-dt/promotion-dt.component';
import { PromotionFormComponent } from './promotion-form/promotion-form.component';
import { PromotionFormKeyCombinationComponent } from './promotion-form/promotion-form-key-combination/promotion-form-key-combination.component';
import { PromotionFormKeyValueComponent } from './promotion-form/promotion-form-key-value/promotion-form-key-value.component';
import { PromotionFormPromotionComponent } from './promotion-form/promotion-form-promotion/promotion-form-promotion.component';
import { PromotionFormOrderItemComponent } from './promotion-form/promotion-form-order-item/promotion-form-order-item.component';
import { PromotionFormOfferItemComponent } from './promotion-form/promotion-form-offer-item/promotion-form-offer-item.component';
import { OfferItemDtComponent } from './promotion-detail/offer-item-dt/offer-item-dt.component';
import { OrderItemDtComponent } from './promotion-detail/order-item-dt/order-item-dt.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { PromotionExportComponent } from './promotion-export/promotion-export.component';

@NgModule({
  declarations: [
    PromotionPageComponent,
    PromotionDetailComponent,
    PromotionDtComponent,
    PromotionFormComponent,
    PromotionFormKeyCombinationComponent,
    PromotionFormKeyValueComponent,
    PromotionFormPromotionComponent,
    PromotionFormOrderItemComponent,
    PromotionFormOfferItemComponent,
    OfferItemDtComponent,
    OrderItemDtComponent,
    PromotionExportComponent,
  ],
  imports: [
    CommonModule,
    PromotionRoutingModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
  ],
})
export class PromotionModule {}
