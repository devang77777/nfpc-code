import { UserLoginLogComponent } from './user-login-log/user-login-log.component';
import { MerchandiserAttendanceComponent } from './merchandiser-attendance/merchandiser-attendance.component';
import { StoreSummaryComponent } from './store-summary/store-summary.component';
import { StockAvailibilityComponent } from './stock-availibility/stock-availibility.component';
import { SosComponent } from './sos/sos.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskSummaryComponent } from './task-summary/task-summary.component';
import { TaskPhotosComponent } from './task-photos/task-photos.component';
import { TaskAnswersComponent } from './task-answers/task-answers.component';
import { OrderItemsComponent } from './order-items/order-items.component';
import { OrderSumamryComponent } from './order-sumamry/order-sumamry.component';
import { VisitSummaryComponent } from './visit-summary/visit-summary.component';
import { ClosedVisitsComponent } from './closed-visits/closed-visits.component';
import { NewCustomerComponent } from './new-customer/new-customer.component';
import { PhotosComponent } from './photos/photos.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { OrderReturnsComponent } from './order-returns/order-returns.component';
import { CompetitorProductComponent } from './competitor-product/competitor-product.component';
import { CategoryComponent } from './category/category.component';
import { MerchandisingAuditComponent } from './merchandising-audit/merchandising-audit.component';
import { VisualMerchandisingComponent } from './visual-merchandising/visual-merchandising.component';
import { PlanogramReportComponent } from './planogram-report/planogram-report.component';
import { JpComplianceComponent } from './jp-compliance/jp-compliance.component';
import { ReportMasterComponent } from './report-master/report-master.component';
import { SalesmanLoginLogComponent } from './salesman-login-log/salesman-login-log.component';

import { ConsolidatedLoadReportComponent } from './consolidated-load-report/consolidated-load-report.component';
import { ConsolidateLoadReturnComponent } from './consolidate-load-return/consolidate-load-return.component';
import { LoadingChartByWarehouseComponent } from './loading-chart-by-warehouse/loading-chart-by-warehouse.component';
import { OrderDetailsReportComponent } from './order-details-report/order-details-report.component';
import { TruckUtilizationReportComponent } from './truck-utilization-report/truck-utilization-report.component';
import { DailyCrfReportComponent } from './daily-crf-report/daily-crf-report.component';
import { SalesQuantityComponent } from './sales-quantity/sales-quantity.component';
import { ReturnGrvComponent } from './return-grv/return-grv.component';
import { SalesGrvComponent } from './sales-grv/sales-grv.component';
import { DifotComponent } from './difot/difot.component';
import { LoadingChartByFinalComponent } from './loading-chart-by-final/loading-chart-by-final.component';
import { DailyGrvReportComponent } from './daily-grv-report/daily-grv-report.component';
import { DriverLoadedQtyComponent } from './driver-loaded-qty/driver-loaded-qty.component';
import { DailySpotReturnComponent } from './daily-spot-return/daily-spot-return.component';
import { DailyCancelOrderComponent } from './daily-cancel-order/daily-cancel-order.component';
import { MonthlyKpiComponent } from './monthly-kpi/monthly-kpi.component';
import { YtdKpiComponent } from './ytd-kpi/ytd-kpi.component';
import { SalesmanPerformanceComponent } from './salesman-performance/salesman-performance.component';
import { DailyOperationReportComponent } from './daily-operation-report/daily-operation-report.component';
import { DeliveryReport } from './delivery-report/delivery-report.component';
import { GeoApprovalsComponent } from './geo-approvals/geo-approvals.component';
import { DeliveryReportsComponent } from './delivery-reports/delivery-reports.component';
import { PalletReportComponent } from './pallet-report/pallet-report.component';
const routes: Routes = [
  // { path: '', redirectTo: 'planogram-compliance', pathMatch: 'full' },
  {
    path: '',
    component: ReportMasterComponent,
    children: [
      { path: 'planogram-compliance', component: PlanogramReportComponent },
      { path: 'visual-merchandising', component: VisualMerchandisingComponent },
      { path: 'merchandising-audit', component: MerchandisingAuditComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'jp-compliance', component: JpComplianceComponent },
      { path: 'competitor-product', component: CompetitorProductComponent },
      { path: 'order-returns', component: OrderReturnsComponent },
      { path: 'timesheets', component: TimesheetsComponent },
      { path: 'photos', component: PhotosComponent },
      { path: 'new-customer', component: NewCustomerComponent },
      { path: 'closed-visits', component: ClosedVisitsComponent },
      { path: 'visit-summary', component: VisitSummaryComponent },
      { path: 'order-sumamry', component: OrderSumamryComponent },
      { path: 'order-items', component: OrderItemsComponent },
      { path: 'task-answers', component: TaskAnswersComponent },
      { path: 'task-photos', component: TaskPhotosComponent },
      { path: 'task-summary', component: TaskSummaryComponent },
      { path: 'sos', component: SosComponent },
      { path: 'stock-availability', component: StockAvailibilityComponent },
      { path: 'store-summary', component: StoreSummaryComponent },
      { path: 'merchandiser-login-log', component: SalesmanLoginLogComponent },
      { path: 'user-login-log', component: UserLoginLogComponent },
      { path: 'merchandiser-attendance', component: MerchandiserAttendanceComponent },
      { path: 'consolidated-load', component: ConsolidatedLoadReportComponent },
      { path: 'consolidated-return-load', component: ConsolidateLoadReturnComponent },
      { path: 'loading-chart-by-warehouse', component: LoadingChartByWarehouseComponent },
      { path: 'order-details', component: OrderDetailsReportComponent },
      { path: 'daily-operation', component: DailyOperationReportComponent },
      { path: 'truck-utilisation', component: TruckUtilizationReportComponent },
      { path: 'daily-crf', component: DailyCrfReportComponent },
      { path: 'sales-quantity', component: SalesQuantityComponent },
      { path: 'return-grv', component: ReturnGrvComponent },
      { path: 'sales-vs-grv', component: SalesGrvComponent },
      { path: 'difot', component: DifotComponent },
      { path: 'delivery-report', component: DeliveryReport },
      { path: 'loading-chart-final-by-route', component: LoadingChartByFinalComponent },
      { path: 'daily-grv', component: DailyGrvReportComponent },
      { path: 'daily-spot-return', component: DailySpotReturnComponent },
      { path: 'driver-loaded-qty', component: DriverLoadedQtyComponent },
      { path: 'daily-cancel-order', component: DailyCancelOrderComponent },
      { path: 'monthly-kpi', component: MonthlyKpiComponent },
      { path: 'ytd-kpi', component: YtdKpiComponent },
      { path: 'salesman-performance', component: SalesmanPerformanceComponent },
      { path: 'geo-approvals', component: GeoApprovalsComponent },
      { path: 'delivery-export-report', component: DeliveryReportsComponent },
      { path: 'pallet-report', component: PalletReportComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
