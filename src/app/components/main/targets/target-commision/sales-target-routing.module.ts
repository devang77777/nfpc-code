import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesTargetBaseComponent } from './sales-target-base/sales-target-base.component';
import { SalesTargetFormComponent } from './sales-target-form/sales-target-form.component';
import { SalesTargetResolveService } from './resolvers/sales-target-resolve.service';
import { SalesTargetViewResolveService } from './resolvers/sales-target-view-resolve.service';

const routes: Routes = [
  {
    path: '',
    component: SalesTargetBaseComponent,
  },
  {
    path: 'add',
    resolve: {
      resolved: SalesTargetResolveService,
    },
    component: SalesTargetFormComponent,
  },
  {
    path: 'edit',
    redirectTo: '',
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved: SalesTargetResolveService,
      salesTarget: SalesTargetViewResolveService,
    },
    component: SalesTargetFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesTargetRoutingModule {}
