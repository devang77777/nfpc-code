

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionRoutingModule } from './transaction-routing.module';
import { OrdersModule } from './orders/orders.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TransactionRoutingModule,
    OrdersModule

  ],
  declarations: [
  ],
  providers: [

  ]
})
export class TrsactionModule { }
