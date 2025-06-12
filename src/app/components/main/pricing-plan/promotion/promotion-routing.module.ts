import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PromotionPageComponent } from './promotion-page/promotion-page.component';
import { AddPromotionFormPageComponent } from 'src/app/components/forms/add-promotion-form-page/add-promotion-form-page.component';
import { PromotionFormComponent } from './promotion-form/promotion-form.component';

const routes: Routes = [
  {
    path: '',
    component: PromotionPageComponent,
  },
  {
    path: 'add',
    component: PromotionFormComponent,
  },
  {
    path: 'edit/:uuid',
    component: PromotionFormComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromotionRoutingModule {}
