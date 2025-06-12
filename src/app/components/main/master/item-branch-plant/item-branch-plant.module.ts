import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemBranchPlantBaseComponent } from './item-branch-plant-base/item-branch-plant-base.component';
import { ItemBranchPlantDtComponent } from './item-branch-plant-dt/item-branch-plant-dt.component';
import { ItemBranchPlantRoutingModule } from './item-branch-plant-routing.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { MasterService } from '../master.service';



@NgModule({
  declarations: [
    ItemBranchPlantBaseComponent,
    ItemBranchPlantDtComponent
  ],
  imports: [
    ItemBranchPlantRoutingModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
  ],
  providers: [
    MasterService
  ]
})
export class ItemBranchPlantModule { }
