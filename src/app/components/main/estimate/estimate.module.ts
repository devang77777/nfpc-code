import { EstimateResolveService } from './estimate-resolve.service';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { EstimateRoutingModule } from './estimate.routing.module';
import { EstimatedtComponent } from './estimatedt/estimatedt.component';
import { EstimatemasterComponent } from './estimatemaster/estimatemaster.component';
import { AddEstimateComponent } from './add-estimate/add-estimate.component';
import { EstimatedetailComponent } from './estimatedetail/estimatedetail.component';
import { EstimateViewResolveService } from './estimate-view-resolve.service';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  exports: [
    EstimatemasterComponent,
    EstimatedtComponent,
    AddEstimateComponent,
    EstimatedetailComponent,
  ],
  declarations: [
    EstimatemasterComponent,
    EstimatedtComponent,
    AddEstimateComponent,
    EstimatedetailComponent,
  ],
  imports: [
    CommonModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialImportModule,
    EstimateRoutingModule,
    NgxPrintModule,
  ],
  providers: [EstimateViewResolveService, EstimateResolveService],
})
export class EstimateModule {}
