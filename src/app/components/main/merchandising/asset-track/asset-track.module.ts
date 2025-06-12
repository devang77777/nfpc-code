import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDragDropModule } from 'ng-drag-drop';
import { AssetTrackRoutingModule } from './asset-track-routing.module';
import { AssetTrackMasterComponent } from './asset-track-master/asset-track-master.component';
import { AssetTrackDtComponent } from './asset-track-dt/asset-track-dt.component';
import { AssetTrackDetailComponent } from './asset-track-detail/asset-track-detail.component';
import { AddAssetTrackComponent } from './add-asset-track/add-asset-track.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { LightboxModule } from 'ngx-lightbox';
import { AgmCoreModule } from '@agm/core';
import { ViewPostListComponent } from './asset-track-detail/view-post-list/view-post-list.component';
import { SurveyListComponent } from './asset-track-detail/survey-list/survey-list.component';
import { SurveyPostListComponent } from './asset-track-detail/survey-post-list/survey-post-list.component';
import { AddSurveyWizardComponent } from './asset-track-detail/add-survey-wizard/add-survey-wizard.component';
import { SruveyQaComponent } from './asset-track-detail/add-survey-wizard/sruvey-qa/sruvey-qa.component';
import { SurveyPreviewComponent } from './asset-track-detail/survey-preview/survey-preview.component';
import { SurveyQaPreviewComponent } from './asset-track-detail/survey-post-list/survey-qa-preview/survey-qa-preview.component';
import { AssetExportComponent } from './asset-export/asset-export.component';
import { AssetTrackImportComponent } from './shelf-track-import/asset-track-import.component';

@NgModule({
  declarations: [
    AssetTrackMasterComponent,
    AssetTrackDtComponent,
    AssetTrackDetailComponent,
    AddAssetTrackComponent,
    ViewPostListComponent,
    SurveyListComponent,
    SurveyPostListComponent,
    AddSurveyWizardComponent,
    SruveyQaComponent,
    SurveyPreviewComponent,
    SurveyQaPreviewComponent,
    AssetExportComponent,
    AssetTrackImportComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    LightboxModule,
    MaterialImportModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAq6kI0d8-Y_RxUc0W0NmiTdq6AX9EW_GM',
      libraries: ['places'],
    }),
    NgDragDropModule.forRoot(),
    AssetTrackRoutingModule,
  ],
})
export class AssetTrackModule {}
