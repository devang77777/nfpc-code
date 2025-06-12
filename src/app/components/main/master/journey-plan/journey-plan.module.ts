import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { JpBaseComponent } from './jp-base/jp-base.component';
import { JourneyPlanRoutingModule } from './journey-plan-routing.module';
import { JourneyPlanDataTableComponent } from './journey-plan-data-table/journey-plan-data-table.component';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { JourneyPlanFormComponent } from './journey-plan-form/journey-plan-form.component';
import { JourneyPlanDetailComponent } from './journey-plan-detail/journey-plan-detail.component';
import { JourneyPlanFormOverviewComponent } from './journey-plan-form/journey-plan-form-overview/journey-plan-form-overview.component';
import { JourneyPlanFormScheduleComponent } from './journey-plan-form/journey-plan-form-schedule/journey-plan-form-schedule.component';
import { JourneyPlanFormCustomersComponent } from './journey-plan-form/journey-plan-form-customers/journey-plan-form-customers.component';
import { JourneyPlanCustomerTableComponent } from './journey-plan-form/journey-plan-form-customers/journey-plan-customer-table/journey-plan-customer-table.component';
import { JourneyPlanCustomerDaysComponent } from './journey-plan-form/journey-plan-form-customers/journey-plan-customer-days/journey-plan-customer-days.component';
import { JpDetailCustomerTableComponent } from './journey-plan-detail/jp-detail-customer-table/jp-detail-customer-table.component';
import { JourneyplanExportComponent } from './journeyplan-export/journeyplan-export.component';
import { JourneyplanImportComponent } from './journeyplan-import/journeyplan-import.component';
import { CustomerVisitListComponent } from './journey-plan-detail/customer-visit-list/customer-visit-list.component';
import { CustomerActivityListComponent } from './journey-plan-detail/customer-activity-list/customer-activity-list.component';

@NgModule({
  imports: [
    CommonModule,
    JourneyPlanRoutingModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DragDropModule
  ],
  declarations: [
    JpBaseComponent,
    JourneyPlanDataTableComponent,
    JourneyPlanFormComponent,
    JourneyPlanDetailComponent,
    JourneyPlanFormOverviewComponent,
    JourneyPlanFormScheduleComponent,
    JourneyPlanFormCustomersComponent,
    JourneyPlanCustomerTableComponent,
    JourneyPlanCustomerDaysComponent,
    JpDetailCustomerTableComponent,
    JourneyplanExportComponent,
    JourneyplanImportComponent,
    CustomerVisitListComponent,
    CustomerActivityListComponent
  ]
})
export class JourneyPlanModule { }
