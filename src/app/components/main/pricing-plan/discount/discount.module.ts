import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscountPageComponent } from './discount-page/discount-page.component';
import { DiscountFormComponent } from './discount-form/discount-form.component';
import { DiscountRoutingModule } from './discount-routing.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DiscountDtComponent } from './discount-dt/discount-dt.component';
import { DiscountDetailComponent } from './discount-detail/discount-detail.component';
import { DiscountFormKeyCombinationComponent } from './discount-form/discount-form-key-combination/discount-form-key-combination.component';
import { DiscountFormKeyValueComponent } from './discount-form/discount-form-key-value/discount-form-key-value.component';
import { DiscountFormDiscountComponent } from './discount-form/discount-form-discount/discount-form-discount.component';
import { DiscountFormSlabTableComponent } from './discount-form/discount-form-discount/discount-form-slab-table/discount-form-slab-table.component';
import { DiscountDetailSlabTableComponent } from './discount-detail/discount-detail-slab-table/discount-detail-slab-table.component';
import { SharedModule } from 'src/app/features/shared/shared.module';



@NgModule({
  declarations: [
    DiscountPageComponent,
    DiscountFormComponent,
    DiscountDtComponent,
    DiscountDetailComponent,
    DiscountFormKeyCombinationComponent,
    DiscountFormKeyValueComponent,
    DiscountFormDiscountComponent,
    DiscountFormSlabTableComponent,
    DiscountDetailSlabTableComponent
  ],
  imports: [
    CommonModule,
    DiscountRoutingModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class DiscountModule { }
