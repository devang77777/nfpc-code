import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesmanmasterComponent } from './salesmanmaster/salesmanmaster.component';


const routes: Routes = [
  {
    path: '',
    component: SalesmanmasterComponent,

  },

];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class SalesPersonRoutingModule { }
