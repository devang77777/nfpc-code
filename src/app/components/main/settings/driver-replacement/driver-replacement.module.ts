import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverReplacementBaseComponent } from './driver-replacement-base/driver-replacement-base.component';
import { DriverReplacementDtComponent } from './driver-replacement-dt/driver-replacement-dt.component';
import { DriverReplacementCreateComponent } from './driver-replacement-create/driver-replacement-create.component';
import { DriverReplacementRoutingModule } from './driver-replacement-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [DriverReplacementBaseComponent, DriverReplacementDtComponent, DriverReplacementCreateComponent],
  imports: [
    CommonModule,
    DriverReplacementRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialImportModule,
    NgSelectModule,
  ]
})
export class DriverReplacementModule { }
