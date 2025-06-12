import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SupervisorRoutingModule } from './supervisor-routing.module';

@NgModule({
  exports: [],
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialImportModule,
    SupervisorRoutingModule,
  ],
})
export class SupervisorModule {}
