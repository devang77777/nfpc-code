import { NgModule } from '@angular/core';
import { CustomerSupervisorBaseComponent } from './customer-supervisor-base/customer-supervisor-base.component';
import { CustomerSupervisorImportComponent } from './customer-supervisor-import/customer-supervisor-import.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [

  {
    path: '',
    component: CustomerSupervisorBaseComponent
  },
  {
    path: 'import',
    component: CustomerSupervisorImportComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerSupervisorRoutingModule { }
