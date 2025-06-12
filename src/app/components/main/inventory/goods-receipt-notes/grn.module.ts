import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GrnRoutingModule} from './grn-routing.module';
import {GrnResolverService} from './resolvers/grn-resolver.service';
import {GrnViewResolverService} from './resolvers/grn-view-resolver.service';
import { GrnBaseComponent } from './grn-base/grn-base.component';
import { GrnDataTableComponent } from './grn-data-table/grn-data-table.component';
import { GrnDetailComponent } from './grn-detail/grn-detail.component';
import { GrnFormComponent } from './grn-form/grn-form.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { GrnExportComponent } from './grn-export/grn-export.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    GrnRoutingModule
  ],
  declarations: [
    GrnBaseComponent,
    GrnDataTableComponent,
    GrnDetailComponent,
    GrnFormComponent,
    GrnExportComponent
  ],
  providers: [
    GrnResolverService,
    GrnViewResolverService
  ]
})
export class GrnModule { }
