import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouteItemGroupMasterPageComponent } from './route-item-group-master-page/route-item-group-master-page.component';
import { RouteItemGroupResolveService } from './route-item-group-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: RouteItemGroupMasterPageComponent,
        resolve: {
            route_resolve: RouteItemGroupResolveService
        }
    }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RouteItemGroupingRoutingModule {}