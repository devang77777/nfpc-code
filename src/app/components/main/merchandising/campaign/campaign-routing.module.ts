import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CampaignImportComponent } from './campaign-import/campaign-import.component';
import { CampaignMasterComponent } from './campaign-master/campaign-master.component';

const routes: Routes = [
  {
    path: '',
    component: CampaignMasterComponent,
  },
  { path: 'import', component: CampaignImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CampaignRoutingModule { }
