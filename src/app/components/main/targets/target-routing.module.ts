
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'salesman-load' },
  {
    path: 'salesman-load',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./salesman-load/salesman-load.module').then(
        (module) => module.SalesmanLoadModule
      ),
  },
  {
    path: 'salesman-unload',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./salesman-unload/salesman-unload.module').then(
        (module) => module.SalesmanUnloadModule
      ),
  },
  {
    path: 'pallet',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pallet/pallet.module').then(
        (module) => module.PalletModule
      ),
  },
  {
    path: 'load-request',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./load-request/load-request.module').then(
        (module) => module.LoadRequestModule
      ),
  },
  {
    path: 'sales-target',
    loadChildren: () =>
      import('./sales-target/sales-target.module').then(
        (module) => module.SalesTargetModule
      )
  },
  {
    path: 'target-comission',
    loadChildren: () =>
      import('./target-commision/sales-target.module').then(
        (module) => module.SalesTargetModule
      )
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TargetRoutingModule { }
