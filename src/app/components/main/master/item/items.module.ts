import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { MasterItemsRoutingModule } from './items-routing.module';
import { ItemPageComponent } from './item-page/item-page.component';
import { ItemDtComponent } from './item-dt/item-dt.component';
import { AddItemFormComponent } from './add-item-form/add-item-form.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';
import { ItemResolveService } from './item-resolve.service';
import { ItemExportComponent } from './item-export/item-export.component';
import { ItemImportComponent } from './item-import/item-import.component';
import { AddItemUomsComponent } from './add-item-uoms-form/add-item-uoms-form.component';
import { AddItemGroupComponent } from './add-item-group-form/add-item-group-form.component';

@NgModule({
  declarations: [
    ItemPageComponent,
    ItemDtComponent,
    ItemDetailComponent,
    AddItemFormComponent,
    ItemExportComponent,
    ItemImportComponent,
    AddItemUomsComponent,
    AddItemGroupComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    MasterItemsRoutingModule,
  ],
  providers: [ItemResolveService],
})
export class MasterItemsModule {}
