import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DepotExpairydtComponent } from './depot-expairydt/depot-expairydt.component';
import { DepotExpairyFormComponent } from './depot-expairy-form/depot-expairy-form.component';
import { DepotExpairyDetailComponent } from './depot-expairy-detail/depot-expairy-detail.component';
import { DepotExpairybaseComponent } from './depot-expairybase/depot-expairybase.component';
import { DepotExpairyRoutingModule } from './depot-routing.module';
import { DepotExpairyResolveService } from './depot-resolver.service';
import { DepotExpairyViewResolveService } from './depot-view-resolver.service';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    DepotExpairyRoutingModule
  ],
  declarations: [
  DepotExpairydtComponent,
  DepotExpairyFormComponent,
  DepotExpairyDetailComponent,
  DepotExpairybaseComponent
],
  providers: [DepotExpairyResolveService,
    DepotExpairyViewResolveService

  ]
})
export class DepotExpairyModule {}
