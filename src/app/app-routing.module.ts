import { TaxmasterComponent } from './components/pages/settings/taxmaster/taxmaster.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationPageComponent } from './components/pages/settings/organization-page/organization-page.component';
import { AuthGuard } from './guards/auth.guard';
import { UserRolePageComponent } from './components/pages/settings/user-role-page/user-role-page.component';
import { AddPromotionFormPageComponent } from './components/forms/add-promotion-form-page/add-promotion-form-page.component';
import { InvitationFormPageComponent } from './components/pages/invitation-form-page/invitation-form-page.component';
import { MasterDownloadComponent } from './components/pages/settings/master-download/master-download.component';

const routes: Routes = [
  { path: 'dashboard', redirectTo: '/dashboard/board1', pathMatch: 'full' },

  { path: '', redirectTo: '/dashboard/board1', pathMatch: 'full' },

  { path: 'settings/organization', component: OrganizationPageComponent },

  { path: 'account/password-change', component: InvitationFormPageComponent },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then((module) => module.AuthModule),
  },
  {
    path: 'settings/master-download', canActivate: [AuthGuard]
    , component: MasterDownloadComponent
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/dashboard/dashboard.module').then(
        (module) => module.DashboardModule
      ),
  },
  {
    path: 'pricing-plan',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/main/pricing-plan/pricing-plan.module').then(
        (module) => module.PricingPlanModule
      ),
  },
  {
    path: 'transaction',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/main/transaction/transaction.module').then(
        (module) => module.TrsactionModule
      ),
  },
  {
    path: 'inventory',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/main/inventory/inventory.module').then(
        (module) => module.InventoryModule
      ),
  },
  {
    path: 'supervisor',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/main/supervisor/supervisor.module').then(
        (module) => module.SupervisorModule
      ),
  },
  {
    path: 'guide',
    loadChildren: () =>
      import('./components/guide/guide.module').then(
        (module) => module.GuideModule
      ),
  },
  {
    path: 'target',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/main/targets/target.module').then(
        (module) => module.TargetModule
      ),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'settings/users', component: UserRolePageComponent },

      {
        path: 'settings/taxes',
        component: TaxmasterComponent,
        data: { animation: 'tax' },
      },
      {
        path: 'masters',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/master/master.module').then(
            (module) => module.MasterModule
          ),
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/settings/setting.module').then(
            (module) => module.SettingModule
          ),
      },
      {
        path: 'grouping',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/grouping/grouping.module').then(
            (module) => module.GroupingModule
          ),
      },
      {
        path: 'salesperson',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/pages/Salesmann/salesman.module').then(
            (module) => module.SalesPersonModule
          ),
      },
      {
        path: 'finance',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/finance/finance.module').then(
            (module) => module.FinanceModule
          ),
      },

      {
        path: 'expense',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/expenses/expense.module').then(
            (module) => module.ExpensesModule
          ),
      },
      {
        path: 'estimate',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/estimate/estimate.module').then(
            (module) => module.EstimateModule
          ),
      },
      {
        path: 'merchandising',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/merchandising/merchandising.module').then(
            (module) => module.MerchandisingModule
          ),
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./components/main/merchandising/reports/reports.module').then(
            (module) => module.ReportsModule
          ),
      },
      { path: 'promotion/add', component: AddPromotionFormPageComponent },

      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
