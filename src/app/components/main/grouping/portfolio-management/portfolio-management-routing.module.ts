import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PortfolioManagementMasterPageComponent } from './portfolio-management-master-page/portfolio-management-master-page.component';

const routes: Routes = [
    {
        path: '',
        component: PortfolioManagementMasterPageComponent,
        // resolve: {
        //     route_resolve: RouteItemGroupResolveService
        // }
    }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PortfolioManagementRoutingModule {}