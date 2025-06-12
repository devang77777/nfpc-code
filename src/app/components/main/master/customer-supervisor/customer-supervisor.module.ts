import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {CustomerSupervisorBaseComponent} from './customer-supervisor-base/customer-supervisor-base.component';
import { CustomerSupervisorImportComponent } from './customer-supervisor-import/customer-supervisor-import.component';
import { CustomerSupervisorRoutingModule } from './customer-supervisor-routing.module';
import { CustomerSupervisorDtComponent } from './customer-supervisor-dt/customer-supervisor-dt.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CustomerService } from '../customer/customer.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerSupervisorExportComponent } from './customer-supervisor-export/customer-supervisor-export.component';


@NgModule({
  declarations: [
    CustomerSupervisorDtComponent,
    CustomerSupervisorBaseComponent,
    CustomerSupervisorImportComponent,
    CustomerSupervisorExportComponent,
  ],
  imports: [
    CustomerSupervisorRoutingModule,
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
export class CustomerSupervisorModule { }
