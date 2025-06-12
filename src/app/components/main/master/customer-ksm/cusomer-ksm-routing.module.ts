import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CusomerKsmBaseComponent } from './cusomer-ksm-base/cusomer-ksm-base.component';
import { CusomerKsmImportComponent } from './cusomer-ksm-import/cusomer-ksm-import.component';


const routes: Routes = [

  {
    path: '',
    component: CusomerKsmBaseComponent
  },
  {
    path: 'import',
    component: CusomerKsmImportComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CusomerKsmRoutingModule { }
