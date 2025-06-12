import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComplaintFeedbackRoutingModule } from './complaint-feedback-routing.module';
import { ComplaintFeedbackDtComponent } from './complaint-feedback-dt/complaint-feedback-dt.component';
import { ComplaintFeedbackMasterComponent } from './complaint-feedback-master/complaint-feedback-master.component';
import { ComplaintFeedbackDetailComponent } from './complaint-feedback-detail/complaint-feedback-detail.component';
import { LightboxModule } from 'ngx-lightbox';
import { AddComplaintFeedbackComponent } from './add-complaint-feedback/add-complaint-feedback.component';
import { ComplaintFeedbackExportComponent } from './complaint-feedback-export/complaint-feedback-export.component';
import { ComplaintFeedbackImportComponent } from './complaint-feedback-import/complaint-feedback-import.component';

@NgModule({
  declarations: [AddComplaintFeedbackComponent, ComplaintFeedbackDtComponent,
    ComplaintFeedbackMasterComponent,
    ComplaintFeedbackDetailComponent,
    ComplaintFeedbackExportComponent,
    ComplaintFeedbackImportComponent,],

  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    LightboxModule,
    ComplaintFeedbackRoutingModule
  ]
})
export class ComplaintFeedbackModule { }
