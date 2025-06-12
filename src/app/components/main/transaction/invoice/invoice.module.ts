import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceBaseComponent } from './invoice-base/invoice-base.component';
import { InvoiceDataTableComponent } from './invoice-data-table/invoice-data-table.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoiceResolveService } from './resolvers/invoice-resolve.service';
import { InvoiceCollectionComponent } from './invoice-collection/invoice-collection.component';
import { InvoiceViewResolveService } from './resolvers/invoice-view-resolve.service';
import { InvoicePdfMakerService } from './invoice-pdf-maker.service';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { InvoiceServices } from './invoice.service';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';
import { GenerateInvoiceResolveService } from './resolvers/generate-invoice-resolve.service';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InvoiceSettingComponent } from './invoice-setting/invoice-setting.component';
import { NgxPrintModule } from 'ngx-print';
import { InvoiceExportComponent } from './invoice-export/invoice-export.component';
import { InvoiceImportComponent } from './invoice-import/invoice-import.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    InvoiceRoutingModule,
    NgxPrintModule,
    NgbPopoverModule,
  ],
  declarations: [
    InvoiceBaseComponent,
    InvoiceDataTableComponent,
    InvoiceDetailComponent,
    InvoiceFormComponent,
    InvoiceCollectionComponent,
    GenerateInvoiceComponent,
    InvoiceSettingComponent,
    InvoiceExportComponent,
    InvoiceImportComponent,
  ],
  providers: [
    InvoiceResolveService,
    InvoiceViewResolveService,
    InvoicePdfMakerService,
    CurrencyPipe,
    InvoiceServices,
    DatePipe,
    GenerateInvoiceResolveService,
  ],
  exports: [InvoiceCollectionComponent],
})
export class InvoiceModule {}
