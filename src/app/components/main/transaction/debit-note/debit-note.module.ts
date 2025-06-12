import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DebitNoteRoutingModule } from './debit-note-routing.module';
import { DebitNoteBaseComponent } from './debit-note-base/debit-note-base.component';
import { DebitNoteDataTableComponent } from './debit-note-data-table/debit-note-data-table.component';
import { DebitNoteDetailComponent } from './debit-note-detail/debit-note-detail.component';
import { DebitNoteFormComponent } from './debit-note-form/debit-note-form.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { DebitNoteService } from './debit-note.service';
import { DebitNoteViewResolveService } from './resolvers/debit-note-view-resolve.service';
import { DebitNoteResolveService } from './resolvers/debit-note-resolve.service';
import { DebitNoteExportComponent } from './debit-note-export/debit-note-export.component';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    DebitNoteRoutingModule,
    NgxPrintModule,
    NgbPopoverModule,
  ],
  declarations: [
    DebitNoteBaseComponent,
    DebitNoteDataTableComponent,
    DebitNoteDetailComponent,
    DebitNoteFormComponent,
    DebitNoteExportComponent,
  ],
  providers: [
    DebitNoteService,
    DebitNoteViewResolveService,
    DebitNoteResolveService,
  ],
})
export class DebitNoteModule {}
