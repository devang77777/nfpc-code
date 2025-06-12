import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';

import { LoadRequestRoutingModule } from './load-request-routing.module';
import { LoadRequestMasterComponent } from './load-request-master/load-request-master.component';
import { LoadRequestDtComponent } from './load-request-dt/load-request-dt.component';
import { LoadRequestDetailComponent } from './load-request-detail/load-request-detail.component';
import { LoadRequestFormComponent } from './load-request-form/load-request-form.component';
import { AddLoadRequestComponent } from './add-load-request/add-load-request.component';
import { AddLoadRequestItemComponent } from './add-load-request/add-load-request-item/add-load-request-item.component';
import { LoadRequestPdfMakerService } from './load-request-detail-pdf.service';


@NgModule({
  declarations: [LoadRequestMasterComponent, LoadRequestDtComponent, LoadRequestDetailComponent, LoadRequestFormComponent, AddLoadRequestComponent, AddLoadRequestItemComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    LightboxModule,
    ReactiveFormsModule,
    MaterialImportModule,
    LoadRequestRoutingModule
  ],
  providers: [
    LoadRequestPdfMakerService
  ]
})
export class LoadRequestModule { }
