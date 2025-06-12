import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReasonRoutingModule } from './reason-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { ItemModule } from '../item/item.module';
import { CreateReasonComponent } from './components/create-reason/create-reason.component';
import { ReasonComponent } from './views/reason/reason.component';
import { ReasondtComponent } from './components/reason-dt/reason-dt.component';

@NgModule({
  declarations: [ReasonComponent, ReasondtComponent, CreateReasonComponent],
  imports: [
    CommonModule,
    ReasonRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ItemModule,
    MaterialImportModule,
    NgSelectModule,
  ],
})
export class ReasonModule {}
