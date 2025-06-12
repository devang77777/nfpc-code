import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanogramMasterComponent } from './planogram-master/planogram-master.component';
import { PlanogramDetailsComponent } from './planogram-details/planogram-details.component';
import { PlanogramImportComponent } from './planogram-import/planogram-import.component';

const routes: Routes = [
  {
    path: '',
    component: PlanogramMasterComponent,
  },
  { path: 'import', component: PlanogramImportComponent },
  { path: ':id', component: PlanogramDetailsComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
})
export class PlanogramRoutingModule {}
