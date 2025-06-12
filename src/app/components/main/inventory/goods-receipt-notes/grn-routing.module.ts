import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GrnBaseComponent } from './grn-base/grn-base.component';
import { GrnViewResolverService } from './resolvers/grn-view-resolver.service';
import { GrnDetailComponent } from './grn-detail/grn-detail.component';
import { GrnResolverService } from './resolvers/grn-resolver.service';
import { GrnFormComponent } from './grn-form/grn-form.component';

const routes: Routes = [
  {
    path: '',
    component: GrnBaseComponent,
    // resolve: {
    //   resolved:GrnResolverService
    // }
  },
  {
    path: 'detail',
    redirectTo: ''
  },
  {
    path: 'detail/:uuid',
    resolve: {
      grn: GrnViewResolverService
    },
    component: GrnDetailComponent
  },
  {
    path: 'add',
    resolve: {
      resolved: GrnResolverService
    },
    component: GrnFormComponent
  },
  {
    path: 'edit',
    redirectTo: ''
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved: GrnResolverService,
      grn: GrnViewResolverService
    },
    component: GrnFormComponent
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
export class GrnRoutingModule { }
