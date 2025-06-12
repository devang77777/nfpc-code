import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerZoneBaseComponent } from './customer-zone-base/customer-zone-base.component';
import { CustomerZoneImportComponent } from './customer-zone-import/customer-zone-import.component';


const routes: Routes = [

  {
    path: '',
    component: CustomerZoneBaseComponent
  },
  {
    path: 'import',
    component: CustomerZoneImportComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomeZoneRoutingModule { }
