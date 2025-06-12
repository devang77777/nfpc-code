import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PriceCheckRoutingModule } from './price-check-routing.module';
import { PriceCheckComponent } from './views/price-check/price-check.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PriceCheckComponent],
  imports: [
    CommonModule,
    PriceCheckRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MaterialImportModule,
  ]
})
export class PriceCheckModule { }
