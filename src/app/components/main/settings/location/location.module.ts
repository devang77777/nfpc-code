import { VanTypeFormComponent } from './van/van-type-form/van-type-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationRoutingModule } from './location-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { CountryPageComponent } from './country/country-page/country-page.component';
import { CountryDtComponent } from './country/country-dt/country-dt.component';
import { CountryDetailComponent } from './country/country-detail/country-detail.component';
import { AddCountryFormComponent } from './country/add-country-form/add-country-form.component';
import { RegionMasterPageComponent } from './region/region-master-page/region-master-page.component';
import { RegionMasterDetailsPageComponent } from './region/region-master-details-page/region-master-details-page.component';
import { RegionMasterDtComponent } from './region/region-master-dt/region-master-dt.component';
import { AddRegionFormComponent } from './region/add-region-form/add-region-form.component';
import { BranchDepotDetailComponent } from './branch/branch-depot-detail/branch-depot-detail.component';
import { BranchDepotMasterDtComponent } from './branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { AddBranchDepotFormComponent } from './branch/add-branch-depot-form/add-branch-depot-form.component';
import { DepotPageComponent } from './branch/depot-page/depot-page.component';
import { RoutePageComponent } from './route/route-page/route-page.component';
import { RouteDetailComponent } from './route/route-detail/route-detail.component';
import { AddRouteFormComponent } from './route/add-route-form/add-route-form.component';
import { RouteMasterDtComponent } from './route/route-master-dt/route-master-dt.component';
import { VanMasterPageComponent } from './van/van-master-page/van-master-page.component';
import { VanDetailComponent } from './van/van-detail/van-detail.component';
import { VanMasterDtComponent } from './van/van-master-dt/van-master-dt.component';
import { AddVanFormComponent } from './van/add-van-form/add-van-form.component';
import { VanCategoryFormComponent } from './van/van-category-form/van-category-form.component';
import { SharedModule } from '../../../../features/shared/shared.module';
import { RegionExportComponent } from './region/region-export/region-export.component';
import { RouteExportComponent } from './route/route-export/route-export.component';
import { ZoneMasterPageComponent } from './zone/zone-master-page/zone-master-page.component';
import { ZoneMasterDtComponent } from './zone/zone-master-dt/zone-master-dt.component';
import { AddZoneFormComponent } from './add-zone-form/add-zone-form.component';
import { OdometerVanEditComponent } from './van/odometer-van-edit/odometer-van-edit.component';

const locationCommonModule = [
  CountryPageComponent,
  CountryDtComponent,
  CountryDetailComponent,
  AddCountryFormComponent,
  RegionMasterPageComponent,
  RegionMasterDetailsPageComponent,
  RegionMasterDtComponent,
  AddRegionFormComponent,
  BranchDepotDetailComponent,
  BranchDepotMasterDtComponent,
  AddBranchDepotFormComponent,
  DepotPageComponent,
  RoutePageComponent,
  RouteDetailComponent,
  AddRouteFormComponent,
  RouteMasterDtComponent,
  VanMasterPageComponent,
  VanDetailComponent,
  VanMasterDtComponent,
  AddVanFormComponent,
  VanCategoryFormComponent,
  VanTypeFormComponent
];

@NgModule({
  declarations: [...locationCommonModule, RegionExportComponent, RouteExportComponent, ZoneMasterPageComponent, ZoneMasterDtComponent, AddZoneFormComponent, OdometerVanEditComponent],
  imports: [
    LocationRoutingModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
  ],
  exports: [...locationCommonModule],
})
export class LocationModule { }
