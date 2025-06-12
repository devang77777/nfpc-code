import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { StockAdjustmentRoutingModule } from './stock-adjustment-routing.module';
import { SaBaseComponent } from './sa-base/sa-base.component';
import { SaDataTableComponent } from './sa-data-table/sa-data-table.component';
import { SaDetailComponent } from './sa-detail/sa-detail.component';
import { SaFormComponent } from './sa-form/sa-form.component';
import { StockAdjustmentResolveService } from './resolvers/stock-adjustment-resolve.service';
import { StockAdjustmentViewResolveService } from './resolvers/stock-adjustment-view-resolve.service';
import { SharedModule } from '../../../../features/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    StockAdjustmentRoutingModule,
  ],
  declarations: [
    SaBaseComponent,
    SaDataTableComponent,
    SaDetailComponent,
    SaFormComponent,
  ],
  providers: [StockAdjustmentResolveService, StockAdjustmentViewResolveService],
})
export class StockAdjustmentModule {}
