import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CollectionBaseComponent } from './collection-base/collection-base.component';
import { CollectionDetailComponent } from './collection-detail/collection-detail.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { CollectionResolveService } from './resolvers/collection-resolve.service';

const routes: Routes = [
  {
    path: '',
    component: CollectionBaseComponent
  },
  {
    path: 'detail',
    redirectTo: '',
  },
  {
    path: 'detail/:uuid',
    component: CollectionDetailComponent
  },
  {
    path: 'add',
    // resolve: {
    //   resolved: CollectionResolveService
    // },
    component: CollectionFormComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CollectionRoutingModule { }
