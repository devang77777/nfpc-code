import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CusomerKsmBaseComponent } from './cusomer-ksm-base/cusomer-ksm-base.component';
import { CusomerKsmDtComponent } from './cusomer-ksm-dt/cusomer-ksm-dt.component';
import { CusomerKsmImportComponent } from './cusomer-ksm-import/cusomer-ksm-import.component';
import { CusomerKsmRoutingModule } from './cusomer-ksm-routing.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CustomerService } from '../customer/customer.service';



@NgModule({
  declarations: [
    CusomerKsmBaseComponent, 
    CusomerKsmDtComponent, 
    CusomerKsmImportComponent],
  imports: [
    CusomerKsmRoutingModule,
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
export class CustomerKSMModule { }
