import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { ItemBranchPlantBaseComponent } from './item-branch-plant-base/item-branch-plant-base.component';


const routes: Routes = [

  {
    path: '',
    component: ItemBranchPlantBaseComponent
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemBranchPlantRoutingModule { }
