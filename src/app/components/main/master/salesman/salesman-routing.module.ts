import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SalesmanPageComponent } from './salesman-page/salesman-page.component';
import { SalesmanResolveService } from './salesman-resolve.service';
import { SalesmanImportComponent } from './salesman-import/salesman-import.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      salesman_resolve: SalesmanResolveService
    },
    component: SalesmanPageComponent
  },
  { path: 'import', component: SalesmanImportComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterSalesmanRoutingModule { }