import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PalletMasterComponent } from './pallet-master/pallet-master.component';
import { AddPalletFormComponent } from './add-pallet-form/add-pallet-form.component';


const routes: Routes = [
  {
    path: '',
    component: PalletMasterComponent,
  },
  {
    path: 'add',
    component: AddPalletFormComponent
  },
  {
    path: 'edit/:uuid',
    component: AddPalletFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PalletRoutingModule { }
