import { MaterialImportModule } from './../../../imports/material-import/material-import.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesmandtComponent } from './salesmandt/salesmandt.component';
import { AddSalesmanComponent } from './add-salesman/add-salesman.component';
import { SalesmanmasterComponent } from './salesmanmaster/salesmanmaster.component';
import { SalesPersonRoutingModule } from './salesman.routing.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    SharedModule,
    SalesPersonRoutingModule

  ],
  declarations: [
    SalesmandtComponent,
    AddSalesmanComponent,
    SalesmanmasterComponent,
  ],
  exports: [
    SalesmandtComponent,
    AddSalesmanComponent,
    SalesmanmasterComponent,
  ],
  providers: [

  ]
})
export class SalesPersonModule { }
