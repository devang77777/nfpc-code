import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddLoadRequestComponent } from './add-load-request/add-load-request.component';
import { LoadRequestFormComponent } from './load-request-form/load-request-form.component';
import { LoadRequestMasterComponent } from './load-request-master/load-request-master.component';


const routes: Routes = [
  {
    path: '',
    component: LoadRequestMasterComponent,
  },
  {
    path: 'add',
    component: AddLoadRequestComponent,
  },
  {
    path: 'loadRequestForm',
    component: LoadRequestFormComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoadRequestRoutingModule { }
