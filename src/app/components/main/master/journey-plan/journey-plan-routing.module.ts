import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JpBaseComponent } from './jp-base/jp-base.component';
import { JourneyPlanFormComponent } from './journey-plan-form/journey-plan-form.component';
import { JourneyplanImportComponent } from './journeyplan-import/journeyplan-import.component';

const routes: Routes = [
  {
    path: '',
    component: JpBaseComponent
  },
  {
    path: 'add',
    component: JourneyPlanFormComponent
  },
  {
    path: 'edit',
    redirectTo: ''
  },
  {
    path: 'edit/:uuid',
    component: JourneyPlanFormComponent
  },
  { path: 'import', component: JourneyplanImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JourneyPlanRoutingModule { }

