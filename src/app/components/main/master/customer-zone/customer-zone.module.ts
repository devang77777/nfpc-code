import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerZoneBaseComponent } from './customer-zone-base/customer-zone-base.component';
import { CustomerZoneDtComponent } from './customer-zone-dt/customer-zone-dt.component';
import { CustomerZoneImportComponent } from './customer-zone-import/customer-zone-import.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CustomeZoneRoutingModule } from './custome-zone-routing.module';
import { CustomerService } from '../customer/customer.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [CustomerZoneBaseComponent, CustomerZoneDtComponent, CustomerZoneImportComponent],
  imports: [
    CustomeZoneRoutingModule,
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
export class CustomerZoneModule { }
