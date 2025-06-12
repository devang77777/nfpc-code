import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDragDropModule } from 'ng-drag-drop';
import { LightboxModule } from 'ngx-lightbox';
import { ShelfDisplayRoutingModule } from './shelf-display-routing.module';
import { ShelfDisplayDtComponent } from './shelf-display-dt/shelf-display-dt.component';
import { ShelfDisplayMasterComponent } from './shelf-display-master/shelf-display-master.component';
import { ShelfDisplayDetailComponent } from './shelf-display-detail/shelf-display-detail.component';
import { AddShelfDisplayComponent } from './add-shelf-display/add-shelf-display.component';
import { ModelstockComponent } from './shelf-display-detail/modelstock/modelstock.component';
import { ModelstockDtComponent } from './shelf-display-detail/modelstock/modelstock-dt/modelstock-dt.component';
import { ModelstockListComponent } from './shelf-display-detail/modelstock-list/modelstock-list.component';
import { ExpiryListComponent } from './shelf-display-detail/expiry-list/expiry-list.component';
import { ImageListComponent } from './shelf-display-detail/images-list/image-list.component';
import { DemageListComponent } from './shelf-display-detail/demage-list/demage-list.component';
import { SurveyListComponent } from './shelf-display-detail/survey-list/survey-list.component';
import { SurveyPostListComponent } from './shelf-display-detail/survey-post-list/survey-post-list.component';
import { AddSurveyWizardComponent } from './shelf-display-detail/add-survey-wizard/add-survey-wizard.component';
import { SruveyQaComponent } from './shelf-display-detail/add-survey-wizard/sruvey-qa/sruvey-qa.component';
import { SurveyPreviewComponent } from './shelf-display-detail/survey-preview/survey-preview.component';
import { SurveyQaPreviewComponent } from './shelf-display-detail/survey-post-list/survey-qa-preview/survey-qa-preview.component';
import { ShelfDisplayExportComponent } from './shelf-display-export/shelf-display-export.component';
import { ShareOfShelfComponent } from './shelf-display-detail/share-of-shelf/share-of-shelf.component';
import { ShelfImportComponent } from './shelf-import/shelf-import.component';

@NgModule({
  declarations: [
    AddShelfDisplayComponent,
    ShelfDisplayDtComponent,
    ShelfDisplayMasterComponent,
    ShelfDisplayDetailComponent,
    ModelstockComponent,
    ModelstockDtComponent,
    ModelstockListComponent,
    ExpiryListComponent,
    DemageListComponent,
    SurveyListComponent,
    SurveyPostListComponent,
    AddSurveyWizardComponent,
    SruveyQaComponent,
    SurveyPreviewComponent,
    SurveyQaPreviewComponent,
    ImageListComponent,
    ShelfDisplayExportComponent,
    ShareOfShelfComponent,
    ShelfImportComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    NgDragDropModule.forRoot(),
    LightboxModule,
    ShelfDisplayRoutingModule,
  ],
})
export class ShelfDisplayModule {}
