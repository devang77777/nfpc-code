import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesTargetRoutingModule } from './sales-target-routing.module';
import { SalesTargetResolveService } from './resolvers/sales-target-resolve.service';
import { SalesTargetViewResolveService } from './resolvers/sales-target-view-resolve.service';
import { SalesTargetBaseComponent } from './sales-target-base/sales-target-base.component';
import { SalesTargetDataTableComponent } from './sales-target-data-table/sales-target-data-table.component';
import { SalesTargetDetailComponent } from './sales-target-detail/sales-target-detail.component';
import { SalesTargetFormComponent } from './sales-target-form/sales-target-form.component';
import { SalesTargetItemModalComponent } from './sales-target-item-modal/sales-target-item-modal.component';
import { StDetailOverviewComponent } from './sales-target-detail/st-detail-overview/st-detail-overview.component';
import { StDetailSalesAchievedComponent } from './sales-target-detail/st-detail-sales-achieved/st-detail-sales-achieved.component';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from '../../../../features/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialImportModule,
    SalesTargetRoutingModule,
  ],
  declarations: [
    SalesTargetBaseComponent,
    SalesTargetDataTableComponent,
    SalesTargetDetailComponent,
    SalesTargetFormComponent,
    SalesTargetItemModalComponent,
    StDetailOverviewComponent,
    StDetailSalesAchievedComponent,
  ],
  providers: [SalesTargetResolveService, SalesTargetViewResolveService],
})
export class SalesTargetModule {}
