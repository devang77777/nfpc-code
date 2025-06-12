import { NgModule } from '@angular/core';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteItemGroupingRoutingModule } from './route-item-grouping-routing.module';
import { RouteItemGroupMasterPageComponent } from './route-item-group-master-page/route-item-group-master-page.component';
import { RouteGroupdtComponent } from './route-groupdt/route-groupdt.component';
import { RouteGroupDetailComponent } from './route-group-detail/route-group-detail.component';
import { AddRouteGroupFormComponent } from './add-route-group-form/add-route-group-form.component';
import { RouteItemGroupResolveService } from './route-item-group-resolver.service';
import { SharedModule } from '../../../../features/shared/shared.module';

@NgModule({
  declarations: [
    RouteItemGroupMasterPageComponent,
    RouteGroupdtComponent,
    RouteGroupDetailComponent,
    AddRouteGroupFormComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    RouteItemGroupingRoutingModule,
    SharedModule,
  ],
  providers: [RouteItemGroupResolveService],
})
export class RouteItemGroupingModule {}
