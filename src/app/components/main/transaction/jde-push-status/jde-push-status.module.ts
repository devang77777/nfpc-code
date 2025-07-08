import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CustomerService } from '../../master/customer/customer.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JdePushStatusBaseComponent } from './jde-push-status-base/jde-push-status-base.component';
import { JdePushStatusDtComponent } from './jde-push-status-dt/jde-push-status-dt.component';
import { JdePushStatusRoutingModule } from './jde-push-status.routing.module';
import { PushStatusFailComponent } from './push-status-fail/push-status-fail.component';
@NgModule({
  declarations: [
    JdePushStatusBaseComponent,
    JdePushStatusDtComponent,
    PushStatusFailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    JdePushStatusRoutingModule
  ],
  providers: [
    CustomerService
  ]
})
export class JdePushStatusModule { }
