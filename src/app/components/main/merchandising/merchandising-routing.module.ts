import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: 'stockinstore',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./stockinstore/stockinstore.module').then(
        (module) => module.StockinstoreModule
      ),
  },
  {
    path: 'complaint-feedback',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./complaint-feedback/complaint-feedback.module').then(
        (module) => module.ComplaintFeedbackModule
      ),
  },
  {
    path: 'competitors',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./competitor/competitor.module').then(
        (module) => module.CompetitorModule
      ),
  },
  {
    path: 'campaigns',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./campaign/campaign.module').then(
        (module) => module.CampaignModule
      ),
  },
  {
    path: 'planograms',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./planogram/planogram.module').then(
        (module) => module.PlanogramModule
      ),
  },
  {
    path: 'shelf-display',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./shelf-display/shelf-display.module').then(
        (module) => module.ShelfDisplayModule
      ),
  },
  {
    path: 'price-check',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./price-check/price-check.module').then(
        (module) => module.PriceCheckModule
      ),
  },
  {
    path: 'sos',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./sos/sos.module').then(
        (module) => module.SosModule
      ),
  },
  {
    path: 'asset-tracking',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./asset-track/asset-track.module').then(
        (module) => module.AssetTrackModule
      ),
  },
  {
    path: 'consumer-survey',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./consumer-survey/consumer-survey.module').then(
        (module) => module.ConsumerSurveyModule
      ),
  },
  {
    path: 'sensory-survey',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./sensory-survey/sensory-survey.module').then(
        (module) => module.SensorySurveyModule
      ),
  },
  {
    path: 'promotional',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./promotional/promotional.module').then(
        (module) => module.PromotionalModule
      ),
  },
  {
    path: 'market-promotion',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./market-promo/market-promo.module').then(
        (module) => module.MarketPromoModule
      ),
  },
  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./reports/reports.module').then(
        (module) => module.ReportsModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchandisingRoutingModule { }
