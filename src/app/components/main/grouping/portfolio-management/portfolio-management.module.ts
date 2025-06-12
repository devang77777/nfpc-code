import { NgModule } from '@angular/core';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortfolioManagementRoutingModule } from './portfolio-management-routing.module';
import { PortfolioManagementMasterPageComponent } from './portfolio-management-master-page/portfolio-management-master-page.component';
import { PortfolioManagementDtComponent } from './portfolio-management-dt/portfolio-management-dt.component';
import { PortfolioManagementDetailPageComponent } from './portfolio-management-detail-page/portfolio-management-detail-page.component';
import { AddPortfolioManagementComponent } from './add-portfolio-management/add-portfolio-management.component';
import { SharedModule } from '../../../../features/shared/shared.module';

@NgModule({
  declarations: [
    PortfolioManagementMasterPageComponent,
    PortfolioManagementDtComponent,
    PortfolioManagementDetailPageComponent,
    AddPortfolioManagementComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    PortfolioManagementRoutingModule,
    SharedModule,
  ],
  providers: [],
})
export class PortfolioManagementModule {}
