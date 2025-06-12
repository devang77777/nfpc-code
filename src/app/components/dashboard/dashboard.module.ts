import { HttpClientModule } from '@angular/common/http';
import { MaterialImportModule } from './../../imports/material-import/material-import.module';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPageComponent } from './views/dashboard-page/dashboard-page.component';
import { CalendarModule } from 'angular-calendar';
import { MerchandisingDashboardComponent } from './components/merchandising-dashboard/merchandising-dashboard.component';
import { CommonDashboardComponent } from './components/common-dashboard/common-dashboard.component';
import { MerchandisingDetailComponent } from './components/merchandising-detail/merchandising-detail.component';
import { Merchandising4DetailComponent } from './components/merchandising-detail-dashboard-4/merchandising-detail-dashboard-4.component';
import { DashboardChartDetailComponent } from './components/dashboard-chart-detail/dashboard-chart-detail.component';
import { MerchandisingDashboard2Component } from './components/merchandising-dashboard2/merchandising-dashboard2.component';
import { MerchanidisingDashboard3Component } from './components/merchanidising-dashboard3/merchanidising-dashboard3.component';
import { MerchandisingDashboard4Component } from './components/merchandising-dashboard4/merchandising-dashboard4.component';
import { MslCustomerDetailsComponent } from './components/merchandising-detail-dashboard-4/msl-customer-details/msl-customer-details.component';
import { JpComplianceComponent } from './components/jp-compliance/jp-compliance.component';
import { CoverageComponent } from './components/coverage/coverage.component';
import { VisitFrequencyComponent } from './components/visit-frequency/visit-frequency.component';
import { MonthlyKpiDashboardComponent } from './components/monthly-kpi-dashboard/monthly-kpi-dashboard.component';
import { TotalDeliveryLive } from './components/total-delivery-live/total-delivery-live.component';
import { Logistic1Component } from './components/logistic1/logistic1.component';
@NgModule({
  declarations: [
    DashboardPageComponent,
    MerchandisingDashboardComponent,
    CommonDashboardComponent,
    MerchandisingDetailComponent,
    DashboardChartDetailComponent,
    Merchandising4DetailComponent,
    MerchandisingDashboard2Component,
    MerchanidisingDashboard3Component,
    MerchandisingDashboard4Component,
    MslCustomerDetailsComponent,
    JpComplianceComponent, CoverageComponent,
    VisitFrequencyComponent,
    MonthlyKpiDashboardComponent,
    TotalDeliveryLive,
    Logistic1Component
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    DashboardRoutingModule,
    CalendarModule,
    HttpClientModule,
  ],
})
export class DashboardModule { }
