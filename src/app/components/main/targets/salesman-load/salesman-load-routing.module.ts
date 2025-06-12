
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SalesmanLoadPageComponent } from './salesman-load-page/salesman-load-page.component';
import { AddSalesmanLoadFormComponent } from './add-salesman-load-form/add-salesman-load-form.component';
import { SalesmanLoadResolveService } from './salesman-load-resolve.service';

const routes: Routes = [
    { path: '', component: SalesmanLoadPageComponent },
    {
        path: 'add',
        // resolve: {
        //     salesman_load_resolve: SalesmanLoadResolveService
        // },
        component: AddSalesmanLoadFormComponent
    },
    {
        path: 'edit/:uuid',
        // resolve: {
        //     salesman_load_resolve: SalesmanLoadResolveService
        // },
        component: AddSalesmanLoadFormComponent
    }
    // {
    //     path: 'salesman-load',
    //     canActivate: [AuthGuard],
    //     loadChildren: () =>
    //       import('./salesman-load/salesman-load.module').then(
    //         (module) => module.SalesmanLoadModule
    //       ),
    // },

]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SalesmanLoadRoutingModule { }
