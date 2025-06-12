import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriverReplacementBaseComponent } from './driver-replacement-base/driver-replacement-base.component';

const routes: Routes = [{ path: '', component: DriverReplacementBaseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverReplacementRoutingModule { }
