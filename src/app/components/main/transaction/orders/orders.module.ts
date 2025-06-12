import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderBaseComponent } from './order-base/order-base.component';
import { OrderDataTableComponent } from './order-data-table/order-data-table.component';
import { OrderFormComponent } from './order-form/order-form.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderTypeFormComponent } from './order-type/order-type-form/order-type-form.component';
import { OrderResolveService } from './resolvers/order-resolve.service';
import { OrderViewResolveService } from './resolvers/order-view-resolve.service';
import { ConvertToDeliveryComponent } from './convert-to-delivery/convert-to-delivery.component';
import { OrderService } from './order.service';
import { OrderViewDetailResolveService } from './resolvers/order-view-detail-resolver.service';
import { SharedModule } from '../../../../features/shared/shared.module';
import { OrderExportComponent } from './order-export/order-export.component';
import { OrderImportComponent } from './order-import/order-import.component';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderUpdateComponent } from './order-update/order-update.component';
import { OcrReadPdfComponent } from './ocr-read-pdf/ocr-read-pdf.component';
import { OrderViewComponent } from './order-view/order-view.component';
import { OrderBulkPdfService } from './order-bulk-pdf.service';
import { InfiniteOrderExportComponent } from './infinite-order-export/infinite-order-export.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPrintModule,
    MaterialImportModule,
    OrdersRoutingModule,
    NgbPopoverModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    OrderBaseComponent,
    OrderDataTableComponent,
    OrderFormComponent,
    OrderDetailComponent,
    OrderTypeFormComponent,
    ConvertToDeliveryComponent,
    OrderExportComponent,
    OrderImportComponent,
    OrderUpdateComponent,
    OcrReadPdfComponent,
    OrderViewComponent,
    InfiniteOrderExportComponent
  ],
  providers: [
    OrderResolveService,
    OrderViewResolveService,
    OrderService,
    DatePipe,
    OrderViewDetailResolveService,
    OrderBulkPdfService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrdersModule { }
