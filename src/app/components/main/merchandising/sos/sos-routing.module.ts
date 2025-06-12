import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SosComponent } from '../sos/sos/sos.component';
import { SoaComponent } from './soa/soa.component';
import { SodComponent } from './sod/sod.component';
import { SosMasterComponent } from './sos-master/sos-master.component';

const routes: Routes = [
  { path: '', redirectTo: 'share-of-shelf', pathMatch: 'full' },
  {
    path: '',
    component: SosMasterComponent,
    children: [
      { path: 'share-of-shelf', component: SosComponent },
      { path: 'share-of-assortment', component: SoaComponent },
      { path: 'share-of-display', component: SodComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SosRoutingModule { }
