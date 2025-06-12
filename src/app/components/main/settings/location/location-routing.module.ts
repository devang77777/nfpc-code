import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CountryPageComponent } from './country/country-page/country-page.component';
import { RegionMasterPageComponent } from './region/region-master-page/region-master-page.component';
import { DepotPageComponent } from './branch/depot-page/depot-page.component';
import { RoutePageComponent } from './route/route-page/route-page.component';
import { VanMasterPageComponent } from './van/van-master-page/van-master-page.component';
import { ZoneMasterPageComponent } from './zone/zone-master-page/zone-master-page.component';


const routes: Routes = [
  { path: '', redirectTo: 'country', pathMatch: 'full' },
  { path: 'country', component: CountryPageComponent },
  { path: 'region', component: RegionMasterPageComponent },
  { path: 'zone', component: ZoneMasterPageComponent },
  { path: 'depot', component: DepotPageComponent },
  { path: 'van', component: VanMasterPageComponent },
  { path: 'route', component: RoutePageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationRoutingModule { }
