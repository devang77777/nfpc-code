import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDragDropModule } from 'ng-drag-drop';
import { ConsumerSurveyRoutingModule } from './consumer-survey-routing.module';
import { ConsumerSurveyMasterComponent } from './consumer-survey-master/consumer-survey-master.component';
import { ConsumerSurveyDtComponent } from './consumer-survey-dt/consumer-survey-dt.component';
import { ConsumerSurveyDetailComponent } from './consumer-survey-detail/consumer-survey-detail.component';
import { SurveyPostListComponent } from './consumer-survey-detail/survey-post-list/survey-post-list.component';
import { LightboxModule } from 'ngx-lightbox';
import { SurveyPreviewComponent } from './consumer-survey-detail/survey-preview/survey-preview.component';
import { AddSurveyWizardComponent } from './consumer-survey-detail/add-survey-wizard/add-survey-wizard.component';
import { SruveyQaComponent } from './consumer-survey-detail/add-survey-wizard/sruvey-qa/sruvey-qa.component';
import { SurveyQaPreviewComponent } from './consumer-survey-detail/survey-post-list/survey-qa-preview/survey-qa-preview.component';

@NgModule({
  declarations: [ConsumerSurveyMasterComponent, ConsumerSurveyDtComponent, ConsumerSurveyDetailComponent, SurveyPostListComponent, SurveyPreviewComponent, SruveyQaComponent,
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
    ConsumerSurveyRoutingModule
  ]
})
export class ConsumerSurveyModule { }
