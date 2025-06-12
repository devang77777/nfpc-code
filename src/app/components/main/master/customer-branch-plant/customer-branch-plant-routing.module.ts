import { NgModule } from '@angular/core';
import { CustomerBranchPlantBaseComponent } from '../customer-branch-plant/customer-branch-plant-base/customer-branch-plant-base.component';
import { CustomerBranchPlantImportComponent } from './customer-branch-plant-import/customer-branch-plant-import.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [

  {
    path: '',
    component: CustomerBranchPlantBaseComponent
  },
  {
    path: 'import',
    component: CustomerBranchPlantImportComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerBranchPlantRoutingModule { }
