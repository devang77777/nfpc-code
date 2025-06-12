import { DepotExpairyFormComponent } from './depot-expairy-form/depot-expairy-form.component';
import { DepotExpairyDetailComponent } from './depot-expairy-detail/depot-expairy-detail.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { DepotExpairyViewResolveService } from './depot-view-resolver.service';
import { DepotExpairybaseComponent } from './depot-expairybase/depot-expairybase.component';
import { DepotExpairyResolveService } from './depot-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: DepotExpairybaseComponent,
    resolve: {
          resolved: DepotExpairyResolveService
        },
  },
   {
     path: 'detail',
     redirectTo: ''
   },
   {
     path: 'detail/:uuid',

     resolve: {
       data: DepotExpairyViewResolveService
     },
     component: DepotExpairyDetailComponent
   },
   {
     path: 'add',
     resolve: {
       resolved: DepotExpairyResolveService
     },
     component: DepotExpairyFormComponent
   },
   {
     path: 'edit',
     redirectTo: ''
   },
   {
     path: 'edit/:uuid',
     resolve: {
       resolved: DepotExpairyResolveService,
       data: DepotExpairyViewResolveService,
     },
     component: DepotExpairyFormComponent
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
export class DepotExpairyRoutingModule { }
