import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionBaseComponent } from './collection-base/collection-base.component';
import { CollectionDataTableComponent } from './collection-data-table/collection-data-table.component';
import { CollectionDetailComponent } from './collection-detail/collection-detail.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { CollectionResolveService } from './resolvers/collection-resolve.service';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CollectionExportComponent } from './collection-export/collection-export.component';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPrintModule,
    CollectionRoutingModule,
    NgbPopoverModule,
  ],
  declarations: [
    CollectionBaseComponent,
    CollectionDataTableComponent,
    CollectionDetailComponent,
    CollectionFormComponent,
    CollectionExportComponent,
  ],
  providers: [CollectionResolveService],
})
export class CollectionModule {}
