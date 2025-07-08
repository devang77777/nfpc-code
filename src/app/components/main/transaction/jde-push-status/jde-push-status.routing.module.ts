import { NgModule } from '@angular/core';
import { JdePushStatusBaseComponent } from './jde-push-status-base/jde-push-status-base.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [

  {
    path: '',
    component: JdePushStatusBaseComponent
  },
//   {
//     path: 'import',
//     component: CustomerSupervisorImportComponent
//   },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JdePushStatusRoutingModule { }
