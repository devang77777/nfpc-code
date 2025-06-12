import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DeliveryBaseComponent } from './delivery-base/delivery-base.component';
import { DeliveryDataTableComponent } from './delivery-data-table/delivery-data-table.component';
import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';
import { DeliveryRoutingModule } from './delivery-routing.module';
import { DeliveryViewResolveService } from './resolvers/delivery-view-resolve.service';
import { DeliveryFormComponent } from './delivery-form/delivery-form.component';
import { DeliveryResolveService } from './resolvers/delivery-resolve.service';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { DeliveryService } from './delivery.service';
import { DeliveryExportComponent } from './delivery-export/delivery-export.component';
import { DeliveryImportComponent } from './delivery-import/delivery-import.component';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeliveryUpdateComponent } from './delivery-update/delivery-update.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    NgxPrintModule,
    DeliveryRoutingModule,
    NgbPopoverModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    DeliveryBaseComponent,
    DeliveryDataTableComponent,
    DeliveryDetailComponent,
    DeliveryFormComponent,
    DeliveryExportComponent,
    DeliveryImportComponent,
    DeliveryUpdateComponent
  ],
  providers: [
    DeliveryViewResolveService,
    DeliveryResolveService,
    DeliveryService,
    DatePipe,
  ],
})
export class DeliveryModule { }
