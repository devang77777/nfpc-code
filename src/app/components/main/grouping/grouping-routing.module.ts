import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: '', redirectTo: 'route-item-group', pathMatch: 'full' },
  {
    path: 'route-item-group',
    loadChildren: () =>
      import('./route-item-grouping/route-item-grouping.module')
        .then((module) => module.RouteItemGroupingModule),
  },
  {
    path: 'portfolio-management',
    loadChildren: () =>
      import('./portfolio-management/portfolio-management.module')
        .then((module) => module.PortfolioManagementModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupingRoutingModule { }