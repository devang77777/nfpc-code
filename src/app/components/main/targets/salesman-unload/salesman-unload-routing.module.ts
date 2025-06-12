import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesmanUnloadMasterComponent } from './salesman-unload-master/salesman-unload-master.component';


const routes: Routes = [
  {
    path: '',
    component: SalesmanUnloadMasterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesmanUnloadRoutingModule { }
