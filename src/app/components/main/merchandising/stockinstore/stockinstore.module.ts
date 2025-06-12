
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { StockinstoreRoutingModule } from './stockinstore.routing.module';
import { StockinstoredtComponent } from './stockinstoredt/stockinstoredt.component';
import { StockinstoreMasterComponent } from './stockinstore-master/stockinstore-master.component';
import { StockinstoreDetailComponent } from './stockinstore-detail/stockinstore-detail.component';
import { AddStockinstoreComponent } from './add-stockinstore/add-stockinstore.component';
import { StockinstoreExportComponent } from './stockinstore-export/stockinstore-export.component';
import { StockinstoreImportComponent } from './stockinstore-import/stockinstore-import.component';
import { DemageListComponent } from './stockinstore-detail/demage-list/demage-list.component';


@NgModule({
  exports: [
    StockinstoredtComponent,
    StockinstoreMasterComponent,
    StockinstoreDetailComponent,
    AddStockinstoreComponent,
    DemageListComponent

  ],
  declarations: [
    StockinstoredtComponent,
    StockinstoreMasterComponent,
    StockinstoreDetailComponent,
    AddStockinstoreComponent,
    StockinstoreExportComponent,
    StockinstoreImportComponent,
    DemageListComponent

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialImportModule,
    StockinstoreRoutingModule
  ]


})
export class StockinstoreModule { }
