import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { LightboxModule } from 'ngx-lightbox';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportMasterComponent } from './report-master/report-master.component';
import { PlanogramReportComponent } from './planogram-report/planogram-report.component';
import { VisualMerchandisingComponent } from './visual-merchandising/visual-merchandising.component';
import { MerchandisingAuditComponent } from './merchandising-audit/merchandising-audit.component';
import { CategoryComponent } from './category/category.component';
import { CompetitorProductComponent } from './competitor-product/competitor-product.component';
import { OrderReturnsComponent } from './order-returns/order-returns.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { PhotosComponent } from './photos/photos.component';
import { NewCustomerComponent } from './new-customer/new-customer.component';
import { ClosedVisitsComponent } from './closed-visits/closed-visits.component';
import { VisitSummaryComponent } from './visit-summary/visit-summary.component';
import { OrderSumamryComponent } from './order-sumamry/order-sumamry.component';
import { OrderItemsComponent } from './order-items/order-items.component';
import { TaskAnswersComponent } from './task-answers/task-answers.component';
import { TaskPhotosComponent } from './task-photos/task-photos.component';
import { TaskSummaryComponent } from './task-summary/task-summary.component';
import { SosComponent } from './sos/sos.component';
import { StockAvailibilityComponent } from './stock-availibility/stock-availibility.component';
import { StoreSummaryComponent } from './store-summary/store-summary.component';
import { SubtableComponent } from './store-summary/subtable/subtable.component';
import { SubAnswertableComponent } from './task-answers/subanswertable/subanswertable.component';
import { ItemtableComponent } from './order-sumamry/itemtable/itemtable.component';
import { ActivitytableComponent } from './timesheets/activitytable/activitytable.component';
import { CustomerTableComponent } from './timesheets/customer-table/customer-table.component';
import { JpComplianceComponent } from './jp-compliance/jp-compliance.component';
import { SalesmanLoginLogComponent } from './salesman-login-log/salesman-login-log.component';
import { MerchandiserAttendanceComponent } from './merchandiser-attendance/merchandiser-attendance.component';
import { UserLoginLogComponent } from './user-login-log/user-login-log.component';
import { ConsolidateLoadReturnComponent } from './consolidate-load-return/consolidate-load-return.component';
import { LoadingChartByWarehouseComponent } from './loading-chart-by-warehouse/loading-chart-by-warehouse.component';
import { ConsolidatedLoadReportComponent } from './consolidated-load-report/consolidated-load-report.component';
import { OrderDetailsReportComponent } from './order-details-report/order-details-report.component';
import { DailyCrfReportComponent } from './daily-crf-report/daily-crf-report.component';
import { TruckUtilizationReportComponent } from './truck-utilization-report/truck-utilization-report.component';
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

@NgModule({
  declarations: [
    ReportMasterComponent,
    PlanogramReportComponent,
    VisualMerchandisingComponent,
    MerchandisingAuditComponent,
    CategoryComponent,
    CompetitorProductComponent,
    OrderReturnsComponent,
    TimesheetsComponent,
    PhotosComponent,
    NewCustomerComponent,
    ClosedVisitsComponent,
    VisitSummaryComponent,
    OrderSumamryComponent,
    OrderItemsComponent,
    TaskAnswersComponent,
    TaskPhotosComponent,
    TaskSummaryComponent,
    SosComponent,
    StockAvailibilityComponent,
    StoreSummaryComponent,
    SubtableComponent,
    ItemtableComponent,
    SubAnswertableComponent,
    ActivitytableComponent,
    CustomerTableComponent,
    JpComplianceComponent,
    SalesmanLoginLogComponent,
    MerchandiserAttendanceComponent,
    UserLoginLogComponent,
    ConsolidatedLoadReportComponent,
    LoadingChartByWarehouseComponent,
    ConsolidateLoadReturnComponent,
    OrderDetailsReportComponent,
    DailyCrfReportComponent,
    TruckUtilizationReportComponent,
    SalesQuantityComponent,
    ReturnGrvComponent,
    SalesGrvComponent,
    DifotComponent,
    LoadingChartByFinalComponent,
    DailyGrvReportComponent,
    DriverLoadedQtyComponent,
    DailySpotReturnComponent,
    DailyCancelOrderComponent,
    MonthlyKpiComponent,
    YtdKpiComponent,
    SalesmanPerformanceComponent,
    DeliveryReport,
    DailyOperationReportComponent,
    GeoApprovalsComponent,
    DeliveryReportsComponent,
    PalletReportComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    LightboxModule,
    ReportsRoutingModule
  ]
})
export class ReportsModule { }
