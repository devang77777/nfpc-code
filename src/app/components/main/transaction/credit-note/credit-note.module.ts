import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CreditNoteBaseComponent } from './credit-note-base/credit-note-base.component';
import { CreditNoteDataTableComponent } from './credit-note-data-table/credit-note-data-table.component';
import { CreditNoteDetailComponent } from './credit-note-detail/credit-note-detail.component';
import { CreditNoteFormComponent } from './credit-note-form/credit-note-form.component';
import { CreditNoteResolveService } from './resolvers/credit-note-resolve.service';
import { CreditNoteViewResolveService } from './resolvers/credit-note-view-resolve.service';
import { CreditNoteRoutingModule } from './credit-note-routing.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CreditNoteItemsComponent } from './credit-note-items/credit-note-items.component';
import { CreditNoteInvoicesComponent } from './credit-note-invoices/credit-note-invoices.component';
import { CreditNoteService } from './credit-note.service';
import { CreditNoteExportComponent } from './credit-note-export/credit-note-export.component';
import { CreditNoteImportComponent } from './credit-note-import/credit-note-import.component';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CreditNoteUpdateComponent } from './credit-note-update/credit-note-update.component';
import { CreditNoteImagesComponent } from './credit-note-images/credit-note-images.component';
import { LightboxModule } from 'ngx-lightbox';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    CreditNoteRoutingModule,
    NgxPrintModule,
    NgbPopoverModule,
    LightboxModule
  ],
  declarations: [
    CreditNoteBaseComponent,
    CreditNoteDataTableComponent,
    CreditNoteDetailComponent,
    CreditNoteFormComponent,
    CreditNoteItemsComponent,
    CreditNoteInvoicesComponent,
    CreditNoteExportComponent,
    CreditNoteImportComponent,
    CreditNoteUpdateComponent,
    CreditNoteImagesComponent
  ],
  providers: [
    CreditNoteResolveService,
    CreditNoteViewResolveService,
    CreditNoteService,
  ],
})
export class CreditNoteModule { }
