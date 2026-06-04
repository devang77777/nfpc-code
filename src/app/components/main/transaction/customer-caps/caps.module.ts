import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CapsBaseComponent } from './caps-base/caps-base.component';
import { CapsDataTableComponent } from './caps-data-table/caps-data-table.component';
import { CapsExportComponent } from './caps-export/caps-export.component';
import { CapsImportComponent } from './caps-import/caps-import.component';
import { CapsRoutingModule } from './caps-routing.module';

import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { LightboxModule } from 'ngx-lightbox';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    CapsRoutingModule,
    NgxPrintModule,
    NgbPopoverModule,
    LightboxModule
  ],
  declarations: [
    CapsBaseComponent,
    CapsDataTableComponent,
    CapsExportComponent,
    CapsImportComponent,

  ],
  providers: [
    // CreditNoteResolveService,
    // CreditNoteViewResolveService,
    // CreditNoteService,
    // Add CustomerService for dependency injection
    // require('../master/customer/customer.service').CustomerService
  ],
})
export class CapsModule { }
