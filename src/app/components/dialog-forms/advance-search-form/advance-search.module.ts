import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdvanceSearchFormComponent } from './advance-search-form.component';
import { AdvanceSearchFormSalesmanLoadComponent } from './advance-search-form-salesman-load/advance-search-form-salesman-load.component';
import { AdvanceSearchFormCustomerComponent } from './advance-search-form-customer/advance-search-form-customer.component';
import { AdvanceSearchFormInvoiceComponent } from './advance-search-form-invoice/advance-search-form-invoice.component';
import { AdvanceSearchFormOrderComponent } from './advance-search-form-order/advance-search-form-order.component';
import { AdvanceSearchFormStockinstoreComponent } from './advance-search-form-stockinstore/advance-search-form-stockinstore.component';
import { AdvanceSearchFormComplaintComponent } from './advance-search-form-complaint/advance-search-form-complaint.component';
import { AdvanceSearchFormCompetitorComponent } from './advance-search-form-competitor/advance-search-form-competitor.component';
import { AdvanceSearchFormDeliveryComponent } from './advance-search-form-delivery/advance-search-form-delivery.component';
import { AdvanceSearchFormItemComponent } from './advance-search-form-item/advance-search-form-item.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdvanceSearchFormCreditnoteComponent } from './advance-search-form-creditnote/advance-search-form-creditnote.component';
import { AdvanceSearchFormDebitnoteComponent } from './advance-search-form-debitnote/advance-search-form-debitnote.component';
import { AdvanceSearchFormCollectionsComponent } from './advance-search-form-collections/advance-search-form-collections.component';
import { AdvanceSearchFormVendorsComponent } from './advance-search-form-vendors/advance-search-form-vendors.component';
import { AdvanceSearchFormPurchaseOrderComponent } from './advance-search-form-purchase-order/advance-search-form-purchase-order.component';
import { AdvanceSearchFormExpenseComponent } from './advance-search-form-expense/advance-search-form-expense.component';
import { AdvanceSearchFormEstimatesComponent } from './advance-search-form-estimates/advance-search-form-estimates.component';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { AdvanceSearchFormCampaignComponent } from './advance-search-form-campaign/advance-search-form-campaign.component';
import { AdvanceSearchFormShelfDisplayComponent } from './advance-search-form-shelf-display/advance-search-form-shelf-display.component';
import { AdvanceSearchFormPlanogramComponent } from './advance-search-form-planogram/advance-search-form-planogram.component';
import { AdvanceSearchFormAssetTrackComponent } from './advance-search-form-asset-track/advance-search-form-asset-track.component';
import { AdvanceSearchFormConsumerComponent } from './advance-search-form-consumer/advance-search-form-consumer.component';
import { AdvanceSearchFormSensoryComponent } from './advance-search-form-sensory/advance-search-form-sensory.component';
import { AdvanceSearchFormPromotionalComponent } from './advance-search-form-promotional/advance-search-form-promotional.component';
import { AdvanceSearchFormSosComponent } from './advance-search-form-sos/advance-search-form-sos.component';
import { AdvanceSearchFormJourneyPlanComponent } from './advance-search-form-journey-plan/advance-search-form-journey-plan.component';
import { AdvanceSearchFormPriceCheckComponent } from './advance-search-form-price-check/advance-search-form-price-check.component';
import { AdvanceSearchFormMarketPromotionComponent } from './advance-search-form-market-promotion/advance-search-form-market-promotion.component';

@NgModule({
  declarations: [
    AdvanceSearchFormCreditnoteComponent,
    AdvanceSearchFormDebitnoteComponent,
    AdvanceSearchFormCollectionsComponent,
    AdvanceSearchFormVendorsComponent,
    AdvanceSearchFormPurchaseOrderComponent,
    AdvanceSearchFormExpenseComponent,
    AdvanceSearchFormEstimatesComponent,
    AdvanceSearchFormComponent,
    AdvanceSearchFormSalesmanLoadComponent,
    AdvanceSearchFormCustomerComponent,
    AdvanceSearchFormInvoiceComponent,
    AdvanceSearchFormOrderComponent,
    AdvanceSearchFormStockinstoreComponent,
    AdvanceSearchFormComplaintComponent,
    AdvanceSearchFormCompetitorComponent,
    AdvanceSearchFormDeliveryComponent,
    AdvanceSearchFormItemComponent,
    AdvanceSearchFormCampaignComponent,
    AdvanceSearchFormShelfDisplayComponent,
    AdvanceSearchFormPlanogramComponent,
    AdvanceSearchFormAssetTrackComponent,
    AdvanceSearchFormConsumerComponent,
    AdvanceSearchFormSensoryComponent,
    AdvanceSearchFormPromotionalComponent,
    AdvanceSearchFormSosComponent,
    AdvanceSearchFormJourneyPlanComponent,
    AdvanceSearchFormPriceCheckComponent,
    AdvanceSearchFormMarketPromotionComponent,
  ],
  exports: [
    AdvanceSearchFormCreditnoteComponent,
    AdvanceSearchFormDebitnoteComponent,
    AdvanceSearchFormCollectionsComponent,
    AdvanceSearchFormVendorsComponent,
    AdvanceSearchFormPurchaseOrderComponent,
    AdvanceSearchFormExpenseComponent,
    AdvanceSearchFormEstimatesComponent,
    AdvanceSearchFormComponent,
    AdvanceSearchFormSalesmanLoadComponent,
    AdvanceSearchFormCustomerComponent,
    AdvanceSearchFormInvoiceComponent,
    AdvanceSearchFormOrderComponent,
    AdvanceSearchFormStockinstoreComponent,
    AdvanceSearchFormComplaintComponent,
    AdvanceSearchFormCompetitorComponent,
    AdvanceSearchFormDeliveryComponent,
    AdvanceSearchFormItemComponent,
    AdvanceSearchFormShelfDisplayComponent,
    AdvanceSearchFormPlanogramComponent,
    AdvanceSearchFormAssetTrackComponent,
    AdvanceSearchFormConsumerComponent,
    AdvanceSearchFormSensoryComponent,
    AdvanceSearchFormPromotionalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    MaterialImportModule,
  ],
})
export class AdvanceSearchModule { }
