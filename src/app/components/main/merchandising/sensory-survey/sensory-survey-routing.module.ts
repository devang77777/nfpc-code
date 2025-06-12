import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SensorySurveyMasterComponent } from './sensory-survey-master/sensory-survey-master.component';


const routes: Routes = [
  {
    path: '',
    component: SensorySurveyMasterComponent,

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SensorySurveyRoutingModule { }
