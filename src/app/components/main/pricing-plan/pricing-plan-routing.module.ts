
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
    {
        path: 'discount',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./discount/discount.module').then(
            (module) => module.DiscountModule
          ),
    },
    {
      path: 'pricing',
      canActivate: [AuthGuard],
      loadChildren: () =>
        import('./pricing-by-tab/pricing-by-tab.module').then(
          (module) => module.PricingByTabModule
        ),
    },
    // {
    //     path: 'pricing',
    //     canActivate: [AuthGuard],
    //     loadChildren: () =>
    //       import('./pricing/pricing.module').then(
    //         (module) => module.PricingModule
    //       ),
    // },
    {
      path: 'promotion',
      canActivate: [AuthGuard],
      loadChildren: () =>
        import('./promotion/promotion.module').then(
          (module) => module.PromotionModule
        ),
  }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PricingPlanRoutingModule {}
