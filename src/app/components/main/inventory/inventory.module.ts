import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryRoutingModule } from './inventory.routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    InventoryRoutingModule,
  ],
  declarations: [],
  providers: [],
})
export class InventoryModule {}
