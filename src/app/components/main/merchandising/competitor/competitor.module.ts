import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompetitorRoutingModule } from './competitor-routing.module';
import { CompetitorMasterComponent } from './competitor-master/competitor-master.component';
import { CompetitorDtComponent } from './competitor-dt/competitor-dt.component';
import { CompetitorDetailsComponent } from './competitor-details/competitor-details.component';
import { LightboxModule } from 'ngx-lightbox';
import { CompetitorImportComponent } from './competitor-import/competitor-import.component';
import { CompetitorExportComponent } from './competitor-export/competitor-export.component';
import { AddCompetitorComponent } from './add-competitor/add-competitor.component';

@NgModule({
  declarations: [CompetitorMasterComponent, CompetitorDtComponent, CompetitorDetailsComponent,
    CompetitorImportComponent,
    CompetitorExportComponent,
    AddCompetitorComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    LightboxModule,
    ReactiveFormsModule,
    MaterialImportModule,
    CompetitorRoutingModule
  ]
})
export class CompetitorModule { }
