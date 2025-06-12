import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseMasterPageComponent } from './warehouse-master-page/warehouse-master-page.component';
import { WarehouseDtComponent } from './warehouse-dt/warehouse-dt.component';
import { AddWarehousePageComponent } from './add-warehouse-page/add-warehouse-page.component';
import { WarehouseDetailPageComponent } from './warehouse-detail-page/warehouse-detail-page.component';
import { SharedModule } from '../../../../features/shared/shared.module';
import { WarehouseRoutingModule } from './warehouse-routing.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AddLocationStorageComponent } from './warehouse-detail-page/add-location-storage/add-location-storage.component';
import { StockItemDtComponent } from './warehouse-detail-page/stock-item-dt/stock-item-dt.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    WarehouseMasterPageComponent,
    WarehouseDtComponent,
    AddWarehousePageComponent,
    WarehouseDetailPageComponent,
    AddLocationStorageComponent,
    StockItemDtComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    WarehouseRoutingModule
  ]
})
export class WarehouseModule { }
