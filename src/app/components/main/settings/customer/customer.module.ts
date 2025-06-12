import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CustomerRoutingModule } from './customer-routing.module';
import { OutletProductFormComponent } from './outlet-product-code/outlet-product-form/outlet-product-form.component';
import { OutletProductDetailComponent } from './outlet-product-code/outlet-product-detail/outlet-product-detail.component';
import { OutletProductDataTableComponent } from './outlet-product-code/outlet-product-data-table/outlet-product-data-table.component';
import { OutletProductPageComponent } from './outlet-product-code/outlet-product-page/outlet-product-page.component';
import { SharedModule } from '../../../../features/shared/shared.module';
import { CreditLimitComponent } from './credit-limits/credit-limit.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';


@NgModule({
  declarations: [
    OutletProductFormComponent,
    OutletProductDetailComponent,
    OutletProductDataTableComponent,
    OutletProductPageComponent,
    CreditLimitComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    CustomerRoutingModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  exports: [],
})
export class CustomerModule {}
