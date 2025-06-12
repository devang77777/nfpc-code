import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MasterVendorRoutingModule } from './vendor-routing.module';
import { VendorMasterPageComponent } from './vendor-master-page/vendor-master-page.component';
import { VendorDetailPageComponent } from './vendor-detail-page/vendor-detail-page.component';
import { VendorDtPageComponent } from './vendor-dt-page/vendor-dt-page.component';
import { AddVendorFormComponent } from './add-vendor-form/add-vendor-form.component';
import { VendorResolveService } from './vendor-resolve.service';

@NgModule({
  declarations: [
    VendorMasterPageComponent,
    VendorDtPageComponent,
    VendorDetailPageComponent,
    AddVendorFormComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    MasterVendorRoutingModule,
    SharedModule,
  ],
  providers: [VendorResolveService],
})
export class VendorModule {}
