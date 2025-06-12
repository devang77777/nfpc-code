import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';

import { SalesmanUnloadRoutingModule } from './salesman-unload-routing.module';
import { SalesmanUnloadMasterComponent } from './salesman-unload-master/salesman-unload-master.component';
import { SalesmanUnloadDtComponent } from './salesman-unload-dt/salesman-unload-dt.component';
import { SalesmanUnloadDetailComponent } from './salesman-unload-detail/salesman-unload-detail.component';


@NgModule({
  declarations: [SalesmanUnloadMasterComponent, SalesmanUnloadDtComponent, SalesmanUnloadDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    LightboxModule,
    ReactiveFormsModule,
    MaterialImportModule,
    SalesmanUnloadRoutingModule
  ]
})
export class SalesmanUnloadModule { }
