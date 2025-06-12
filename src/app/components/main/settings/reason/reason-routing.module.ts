import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReasonComponent } from './views/reason/reason.component';

const routes: Routes = [{ path: '', component: ReasonComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReasonRoutingModule {}
