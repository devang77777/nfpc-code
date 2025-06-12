import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MerchandisingRoutingModule } from './merchandising-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,

    MerchandisingRoutingModule
  ]
})
export class MerchandisingModule { }
