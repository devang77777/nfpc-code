import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { ItemRoutingModule } from './item-routing.module';
import { ItemgroupDtComponent } from './item-group/itemgroup-dt/itemgroup-dt.component';
import { ItemGroupDetailsPageComponent } from './item-group/item-group-details-page/item-group-details-page.component';
import { ItemGroupMasterPageComponent } from './item-group/item-group-master-page/item-group-master-page.component';
import { AddItemGroupFormComponent } from './item-group/add-item-group-form/add-item-group-form.component';
import { ItemuomsDtComponent } from './item-uom/itemuoms-dt/itemuoms-dt.component';
import { ItemUomsDetailComponent } from './item-uom/Item-Uoms-Details/item-Uoms-detail.component';
import { AddItemUomsFormComponent } from './item-uom/add-item-uoms-form/add-item-uoms-form.component';
import { ItemUomsMasterPageComponent } from './item-uom/item-Uoms-master-page/items-Uoms-master-page.component';

@NgModule({
  declarations: [
    ItemgroupDtComponent,
    ItemGroupDetailsPageComponent,
    ItemGroupMasterPageComponent,
    AddItemGroupFormComponent,
    ItemuomsDtComponent,
    ItemUomsDetailComponent,
    AddItemUomsFormComponent,
    ItemUomsMasterPageComponent
   ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    ItemRoutingModule
  ],
  exports: [ ]
})
export class ItemModule { }
