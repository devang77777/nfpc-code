import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignMasterComponent } from './campaign-master/campaign-master.component';
import { CampaignRoutingModule } from './campaign-routing.module';
import { MaterialImportModule } from '../../../../imports/material-import/material-import.module';
import { SharedModule } from '../../../../features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CampaignDtComponent } from './campaign-dt/campaign-dt.component';
import { CampaignDetailsComponent } from './campaign-details/campaign-details.component';
import { LightboxModule } from 'ngx-lightbox';
import { CampaignExportComponent } from './campaign-export/campaign-export.component';
import { CampaignImportComponent } from './campaign-import/campaign-import.component';
@NgModule({
  declarations: [
    CampaignMasterComponent,
    CampaignDtComponent,
    CampaignDetailsComponent,
    CampaignExportComponent,
    CampaignImportComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    LightboxModule,
    CampaignRoutingModule,
  ],
})
export class CampaignModule { }
