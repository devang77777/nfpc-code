import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerPageComponent } from './customer-page/customer-page.component';
import { CustomerDtComponent } from './customer-dt/customer-dt.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { CustomerDetailStatementComponent } from './customer-detail/customer-detail-statement/customer-detail-statement.component';
import { CustomerDetailSalesComponent } from './customer-detail/customer-detail-sales/customer-detail-sales.component';
import { CustomerDetailOverviewComponent } from './customer-detail/customer-detail-overview/customer-detail-overview.component';
import { OverviewRightPanelComponent } from './customer-detail/customer-detail-overview/overview-right-panel/overview-right-panel.component';
import { OverviewLeftPannelComponent } from './customer-detail/customer-detail-overview/overview-left-pannel/overview-left-pannel.component';
import { CustomerDetailCommentComponent } from './customer-detail/customer-detail-comment/customer-detail-comment.component';
import { ChartModule } from 'primeng/chart';
import { CustomerResolveService } from './customer-resolve.service';
import { CustomerService } from './customer.service';
import { NgxPrintModule } from 'ngx-print';
import { SalesFilterComponent } from './customer-detail/sales-filter/sales-filter.component';
import { CustomerImportComponent } from './customer-import/customer-import.component';
import { CustomerCategoryFormComponent } from './customer-category-form/customer-category-form.component';
import { AgmCoreModule } from '@agm/core';
import { AddCustomerFormComponent } from './add-customer-form/add-customer-form.component';
import { CutomerDetailTabsComponent } from './customer-detail/cutomer-detail-tabs/cutomer-detail-tabs.component';
import { CustomerGeoImport } from './customer-geo-import/customer-geo-import.component';
@NgModule({
  declarations: [
    CustomerPageComponent,
    CustomerDtComponent,
    AddCustomerFormComponent,
    CustomerDetailComponent,
    CustomerDetailStatementComponent,
    CustomerDetailSalesComponent,
    CustomerDetailOverviewComponent,
    OverviewRightPanelComponent,
    OverviewLeftPannelComponent,
    CustomerDetailCommentComponent,
    SalesFilterComponent,
    CustomerImportComponent,
    CustomerCategoryFormComponent,
    CutomerDetailTabsComponent,
    CustomerGeoImport
  ],
  imports: [
    CustomerRoutingModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    ChartModule,
    NgxPrintModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAq6kI0d8-Y_RxUc0W0NmiTdq6AX9EW_GM',
      libraries: ['places']
    }),
  ],
  providers: [CustomerResolveService, CustomerService],
})
export class CustomerModule { }
