import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MerchandisingReplaceRoutingModule } from './merchandising-replace-routing.module';
import { ReplaceComponent } from './views/replace/replace.component';
import { CreateReplaceComponent } from './components/create-replace/create-replace.component';
import { ReplaceDtComponent } from './components/replace-dt/replace-dt.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { ItemModule } from '../item/item.module';


@NgModule({
  declarations: [ReplaceComponent, CreateReplaceComponent, ReplaceDtComponent],
  imports: [
    CommonModule,
    MerchandisingReplaceRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ItemModule,
    MaterialImportModule,
    NgSelectModule,
  ]
})
export class MerchandisingReplaceModule { }
