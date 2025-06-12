import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DiscountFormComponent } from './discount-form/discount-form.component';
import { DiscountPageComponent } from './discount-page/discount-page.component';
const routes: Routes = [
  {
    path: '',
    component: DiscountPageComponent
  },
  {
    path: 'add',
    component: DiscountFormComponent
  },
  {
    path: 'edit/:uuid',
    component: DiscountFormComponent
  }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DiscountRoutingModule { }