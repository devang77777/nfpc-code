import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsumerSurveyMasterComponent } from './consumer-survey-master/consumer-survey-master.component';


const routes: Routes = [
  {
    path: '',
    component: ConsumerSurveyMasterComponent,

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsumerSurveyRoutingModule { }
