import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanogramMasterComponent } from './planogram-master/planogram-master.component';
import { PlanogramDtComponent } from './planogram-dt/planogram-dt.component';
import { PlanogramDetailsComponent } from './planogram-details/planogram-details.component';
import { SharedModule } from '../../../../features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from '../../../../imports/material-import/material-import.module';
import { PlanogramRoutingModule } from './planogram-routing.module';
import { AddPlanogramComponent } from './add-planogram/add-planogram.component';
import { ViewPostListComponent } from './planogram-details/view-post-list/view-post-list.component';
import { LightboxModule } from 'ngx-lightbox';
import { PlanogramExportComponent } from './planogram-export/planogram-export.component';
import { PlanogramImportComponent } from './planogram-import/planogram-import.component';

@NgModule({
  declarations: [
    PlanogramMasterComponent,
    PlanogramDtComponent,
    PlanogramDetailsComponent,
    AddPlanogramComponent,
    ViewPostListComponent,
    PlanogramExportComponent,
    PlanogramImportComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    LightboxModule,
    PlanogramRoutingModule,
  ],
})
export class PlanogramModule {}
