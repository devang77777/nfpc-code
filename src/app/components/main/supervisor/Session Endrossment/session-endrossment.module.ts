
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AddWastageComponent } from './add-session-endrossment/add-wastage/add-wastage.component';
import { AddRoutetransferComponent } from './add-session-endrossment/add-routetransfer/add-routetransfer.component';
import { AddPretripinspectionComponent } from './add-session-endrossment/add-pretripinspection/add-pretripinspection.component';
import { AddPresalesAllocationComponent } from './add-session-endrossment/add-presales-allocation/add-presales-allocation.component';
import { AddMissedcallComponent } from './add-session-endrossment/add-missedcall/add-missedcall.component';
import { AddItemwiseComponent } from './add-session-endrossment/add-itemwise/add-itemwise.component';
import { AddItemexceptionComponent } from './add-session-endrossment/add-itemexception/add-itemexception.component';
import { AddItemGroupComponent } from './add-session-endrossment/add-item-group/add-item-group.component';
import { AddFocComponent } from './add-session-endrossment/add-foc/add-foc.component';
import { AddCarryoverComponent } from './add-session-endrossment/add-carryover/add-carryover.component';
import { AddCallComponent } from './add-session-endrossment/add-call/add-call.component';
import { AddByChannelComponent } from './add-session-endrossment/add-by-channel/add-by-channel.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SessionAdjustmentRoutingModule } from './session-endrossment.routing.module';
import { SessionMasterComponent } from './session-master/session-master.component';
import { SessionEndrossmentdtComponent } from './session-endrossmentdt/session-endrossmentdt.component';
import { AddSessionEndrossmentComponent } from './add-session-endrossment/add-session-endrossment.component';
import { AddInvoiceFormComponent } from './add-session-endrossment/add-invoice-form/add-invoice-form.component';

@NgModule({
  exports: [
    SessionMasterComponent,
    SessionEndrossmentdtComponent,
    AddSessionEndrossmentComponent,
    AddWastageComponent,
    AddRoutetransferComponent,
    AddPretripinspectionComponent,
    AddPresalesAllocationComponent,
    AddMissedcallComponent,
    AddItemwiseComponent,
    AddItemexceptionComponent,
    AddItemGroupComponent,
    AddInvoiceFormComponent,
    AddFocComponent,
    AddCarryoverComponent,
    AddCallComponent,
    AddByChannelComponent


  ],
  declarations: [
    SessionMasterComponent,
    SessionEndrossmentdtComponent,
    AddSessionEndrossmentComponent,
    AddWastageComponent,
    AddRoutetransferComponent,
    AddPretripinspectionComponent,
    AddPresalesAllocationComponent,
    AddMissedcallComponent,
    AddItemwiseComponent,
    AddItemexceptionComponent,
    AddItemGroupComponent,
    AddInvoiceFormComponent,
    AddFocComponent,
    AddCarryoverComponent,
    AddCallComponent,
    AddByChannelComponent

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialImportModule,
    SessionAdjustmentRoutingModule

  ]


})
export class SessionModule { }
