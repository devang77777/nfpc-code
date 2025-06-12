import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';

const routes: Routes = [
  { path: 'export', component: ExportDialogComponent },
  { path: '', redirectTo: 'customer', pathMatch: 'full' },
  {
    path: 'customer',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer/customer.module').then(
        (module) => module.CustomerModule
      ),
  },
  {
    path: 'customer-branch-plant',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer-branch-plant/customer-branch-plant.module').then(
        (module) => module.CustomerBranchPlantModule
      ),
  },
   {
    path: 'customer-supervisor',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer-supervisor/customer-supervisor.module').then(
        (module) => module.CustomerSupervisorModule
      ),
  },
  {
    path: 'customer-region',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer-zone/customer-zone.module').then(
        (module) => module.CustomerZoneModule
      ),
  },
  {
    path: 'customer-ksm-mapping',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer-ksm/customer-ksm.module').then(
        (module) => module.CustomerKSMModule
      ),
  },
  {
    path: 'item',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./item/items.module').then(
        (module) => module.MasterItemsModule
      ),
  },
  {
    path: 'item-branch-plant',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./item-branch-plant/item-branch-plant.module').then(
        (module) => module.ItemBranchPlantModule
      ),
  },
  {
    path: 'salesman',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./salesman/salesman.module').then(
        (module) => module.SalesmanModule
      ),
  },
  {
    path: 'merchandiser',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./salesman/salesman.module').then(
        (module) => module.SalesmanModule
      ),
  },
  {
    path: 'journey-plan',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./journey-plan/journey-plan.module').then(
        (module) => module.JourneyPlanModule
      ),
  },
  {
    path: 'vendor',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./vendor/vendor.module').then(
        (module) => module.VendorModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule { }