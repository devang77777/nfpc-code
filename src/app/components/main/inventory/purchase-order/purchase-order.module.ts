import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { PurchaseOrderRoutingModule } from './purchase-order-routing.module';
import { PurchaseOrderBaseComponent } from './purchase-order-base/purchase-order-base.component';
import { PurchaseOrderDataTableComponent } from './purchase-order-data-table/purchase-order-data-table.component';
import { PurchaseOrderDetailComponent } from './purchase-order-detail/purchase-order-detail.component';
import { PurchaseOrderFormComponent } from './purchase-order-form/purchase-order-form.component';
import { PurchaseOrderResolveService } from './resolvers/purchase-order-resolve.service';
import { PurchaseOrderViewResolveService } from './resolvers/purchase-order-view-resolve.service';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialImportModule,
    PurchaseOrderRoutingModule
  ],
  declarations: [
    PurchaseOrderBaseComponent,
    PurchaseOrderDataTableComponent,
    PurchaseOrderDetailComponent,
    PurchaseOrderFormComponent
  ],
  providers: [
    PurchaseOrderResolveService,
    PurchaseOrderViewResolveService
  ]
})
export class PurchaseOrderModule { }
