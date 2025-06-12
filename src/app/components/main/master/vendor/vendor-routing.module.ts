import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { VendorMasterPageComponent } from './vendor-master-page/vendor-master-page.component';
import { VendorResolveService } from './vendor-resolve.service';

const routes: Routes = [
    { path: '', component: VendorMasterPageComponent, resolve: {
      vendor_resolve: VendorResolveService
    }, }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MasterVendorRoutingModule {}
