import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreferencesRoutingModule } from './preferences-routing.module';
import { CustomFieldComponent } from './views/custom-field/custom-field.component';
import { WorkFlowComponent } from './views/work-flow/work-flow.component';
import { PreferenceParentComponent } from './components/preference-parent/preference-parent.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PreferenceDetailComponent } from './components/preference-detail/preference-detail.component';
import { AddWorkflowComponent } from './views/add-workflow/add-workflow.component';
import { EditPreferenceComponent } from './views/edit-preference/edit-preference.component';
import { InvoiceTemplateComponent } from './views/invoice-template/invoice-template.component';
import { ActivityProfileComponent } from './views/activity-profile/activity-profile.component';
import { AddActivityProfileComponent } from './views/add-activity-profile/add-activity-profile.component';
import { LightboxModule } from 'ngx-lightbox';
import { ThemeComponent } from './views/theme/theme.component';

@NgModule({
  declarations: [
    CustomFieldComponent,
    WorkFlowComponent,
    PreferenceParentComponent,
    PreferenceDetailComponent,
    AddWorkflowComponent,
    EditPreferenceComponent,
    InvoiceTemplateComponent,
    ActivityProfileComponent,
    AddActivityProfileComponent,
    ThemeComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    PreferencesRoutingModule,
    LightboxModule,
  ],
})
export class PreferencesModule {}
