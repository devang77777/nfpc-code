import { InvoiceTemplateComponent } from './views/invoice-template/invoice-template.component';
import { AddWorkflowComponent } from './views/add-workflow/add-workflow.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreferenceParentComponent } from './components/preference-parent/preference-parent.component';
import { WorkFlowComponent } from './views/work-flow/work-flow.component';
import { CustomFieldComponent } from './views/custom-field/custom-field.component';
import { PreferenceDetailComponent } from './components/preference-detail/preference-detail.component';
import { EditPreferenceComponent } from './views/edit-preference/edit-preference.component';
import { ActivityProfileComponent } from './views/activity-profile/activity-profile.component';
import { AddActivityProfileComponent } from './views/add-activity-profile/add-activity-profile.component';
import { ThemeComponent } from './views/theme/theme.component';

const routes: Routes = [
  { path: '', redirectTo: 'work-flow', pathMatch: 'full' },
  {
    path: '',
    component: PreferenceParentComponent,
    children: [
      { path: 'work-flow', component: WorkFlowComponent },
      { path: 'custom-fields', component: CustomFieldComponent },
      { path: 'detail', component: PreferenceDetailComponent },
      { path: 'add', component: AddWorkflowComponent },
      { path: 'edit', component: EditPreferenceComponent },
      { path: 'templates', component: InvoiceTemplateComponent },
      { path: 'activity-profile', component: ActivityProfileComponent },
      { path: 'add-activity-profile', component: AddActivityProfileComponent },
      { path: 'edit-activity-profile', component: AddActivityProfileComponent },
      { path: 'theme', component: ThemeComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreferencesRoutingModule {}
