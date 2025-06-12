import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerBranchPlantDtComponent } from './customer-branch-plant-dt/customer-branch-plant-dt.component';
import { CustomerBranchPlantBaseComponent } from '../customer-branch-plant/customer-branch-plant-base/customer-branch-plant-base.component';
import { CustomerBranchPlantImportComponent } from './customer-branch-plant-import/customer-branch-plant-import.component';
import { CustomerBranchPlantRoutingModule } from './customer-branch-plant-routing.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CustomerService } from '../customer/customer.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CustomerBranchPlantDtComponent,
    CustomerBranchPlantBaseComponent,
    CustomerBranchPlantImportComponent,
  ],
  imports: [
    CustomerBranchPlantRoutingModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
  ],
  providers: [
    CustomerService
  ]
})
export class CustomerBranchPlantModule { }
