import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddVanToVanComponent } from './add-van-to-van/add-van-to-van.component';
import { VanToVanDetailPageComponent } from './van-to-van-detail-page/van-to-van-detail-page.component';
import { VanToVanMasterComponent } from './van-to-van-master/van-to-van-master.component';
import { VanToVanResolverService } from './Resolvers/van-resolver.service';
import { VantoVanViewResolveService } from './Resolvers/van-view-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: VanToVanMasterComponent,
    resolve: {
      resolved: VanToVanResolverService
    },
  },
  {
    path: 'detail/:uuid',
    component: VanToVanDetailPageComponent,
    resolve: {
      returnvan: VantoVanViewResolveService
    },
  },
  {
    path: 'edit/:uuid',
    component: AddVanToVanComponent,
    resolve: {
      returnvan: VantoVanViewResolveService,
      resolved: VanToVanResolverService
    },
  },
  {
    path: 'add',
    component: AddVanToVanComponent,
    resolve: {
      resolved: VanToVanResolverService
    },
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
export class VanToVanRoutingModule { }

