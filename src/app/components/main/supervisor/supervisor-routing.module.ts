
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
    {
        path: 'van-to-van-transfer',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./van-to-van/van-to-van.module').then(
            (module) => module.VanToVanModule
          ),
    },
    {
      path: 'session',
      canActivate: [AuthGuard],
      loadChildren: () =>
        import('./Session Endrossment/session-endrossment.module').then(
          (module) => module.SessionModule
        ),
    },
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SupervisorRoutingModule {}
