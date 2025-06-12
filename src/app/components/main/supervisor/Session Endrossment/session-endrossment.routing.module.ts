import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionMasterComponent } from './session-master/session-master.component';
import { AddSessionEndrossmentComponent } from './add-session-endrossment/add-session-endrossment.component';
import { SharedModule } from '../../../../features/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: SessionMasterComponent,
  },

  {
    path: 'add',
    component: AddSessionEndrossmentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class SessionAdjustmentRoutingModule {}
