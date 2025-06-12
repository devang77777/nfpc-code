import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDragDropModule } from 'ng-drag-drop';
import { SensorySurveyRoutingModule } from './sensory-survey-routing.module';
import { SensorySurveyMasterComponent } from './sensory-survey-master/sensory-survey-master.component';
import { SensorySurveyDtComponent } from './sensory-survey-dt/sensory-survey-dt.component';
import { SensorySurveyDetailComponent } from './sensory-survey-detail/sensory-survey-detail.component';
import { SurveyPostListComponent } from './sensory-survey-detail/survey-post-list/survey-post-list.component';
import { LightboxModule } from 'ngx-lightbox';
import { SurveyPreviewComponent } from './sensory-survey-detail/survey-preview/survey-preview.component';
import { AddSurveyWizardComponent } from './sensory-survey-detail/add-survey-wizard/add-survey-wizard.component';
import { SruveyQaComponent } from './sensory-survey-detail/add-survey-wizard/sruvey-qa/sruvey-qa.component';
import { SurveyQaPreviewComponent } from './sensory-survey-detail/survey-post-list/survey-qa-preview/survey-qa-preview.component';

@NgModule({
  declarations: [SensorySurveyMasterComponent, SensorySurveyDtComponent, SensorySurveyDetailComponent, SurveyPostListComponent, SurveyPreviewComponent, SruveyQaComponent,
    AddSurveyWizardComponent,
    SruveyQaComponent,
    SurveyQaPreviewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    LightboxModule,
    MaterialImportModule,
    NgDragDropModule.forRoot(),
    SensorySurveyRoutingModule
  ]
})
export class SensorySurveyModule { }
