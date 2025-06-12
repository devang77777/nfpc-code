import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { MasterRoutingModule } from './master-routing.module';
import { MasterItemsModule } from './item/items.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorModule } from './vendor/vendor.module';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';

@NgModule({
    declarations: [ExportDialogComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialImportModule,
        MasterRoutingModule,
        VendorModule,
        MasterItemsModule
    ]
})
export class MasterModule {}