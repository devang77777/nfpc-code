import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComplaintFeedbackMasterComponent } from './complaint-feedback-master/complaint-feedback-master.component';
import { ComplaintFeedbackImportComponent } from './complaint-feedback-import/complaint-feedback-import.component';



const routes: Routes = [
  {
    path: '',
    component: ComplaintFeedbackMasterComponent,

  },
  { path: 'import', component: ComplaintFeedbackImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComplaintFeedbackRoutingModule { }
