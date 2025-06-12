import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SosComponent } from './sos/sos.component';
import { SoaComponent } from './soa/soa.component';
import { SodComponent } from './sod/sod.component';
import { SosMasterComponent } from './sos-master/sos-master.component';
import { SosRoutingModule } from './sos-routing.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';

@NgModule({
  declarations: [SosComponent, SoaComponent, SodComponent, SosMasterComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    SosRoutingModule
  ]
})
export class SosModule { }
