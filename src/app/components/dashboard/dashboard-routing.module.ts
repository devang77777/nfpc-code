import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonDashboardComponent } from './components/common-dashboard/common-dashboard.component';
import { CoverageComponent } from './components/coverage/coverage.component';
import { JpComplianceComponent } from './components/jp-compliance/jp-compliance.component';
import { MerchandisingDashboardComponent } from './components/merchandising-dashboard/merchandising-dashboard.component';
import { MerchandisingDashboard2Component } from './components/merchandising-dashboard2/merchandising-dashboard2.component';
import { MerchandisingDashboard4Component } from './components/merchandising-dashboard4/merchandising-dashboard4.component';
import { MerchanidisingDashboard3Component } from './components/merchanidising-dashboard3/merchanidising-dashboard3.component';
import { MonthlyKpiDashboardComponent } from './components/monthly-kpi-dashboard/monthly-kpi-dashboard.component';
import { VisitFrequencyComponent } from './components/visit-frequency/visit-frequency.component';
import { DashboardPageComponent } from './views/dashboard-page/dashboard-page.component';
import { TotalDeliveryLive } from './components/total-delivery-live/total-delivery-live.component';
import { Logistic1Component } from './components/logistic1/logistic1.component';
import { OrderAnalysisDashboardComponent } from './components/order-analysis-dashboard/order-analysis-dashboard.component';
const routes: Routes = [
  {
    path: '', component: DashboardPageComponent,
    children: [
      { path: 'board1', component: MerchandisingDashboard4Component },
      { path: 'board2', component: MerchandisingDashboard2Component },
      { path: 'board3', component: MerchanidisingDashboard3Component },
      { path: 'board4', component: MerchandisingDashboardComponent },
      { path: 'board5', component: CommonDashboardComponent },
      { path: 'jp-compliance', component: JpComplianceComponent },
      { path: 'coverage', component: CoverageComponent },
      { path: 'visit-frequency', component: VisitFrequencyComponent},
      { path: 'monthly-kpi', component: MonthlyKpiDashboardComponent },
      { path: 'order-analysis', component: OrderAnalysisDashboardComponent },
      { path: 'live-tracking', component: TotalDeliveryLive },
      { path: 'logistic', component: Logistic1Component },



    ]
  },

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
