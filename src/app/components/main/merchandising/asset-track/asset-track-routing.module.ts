import { AssetTrackImportComponent } from './shelf-track-import/asset-track-import.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetTrackMasterComponent } from './asset-track-master/asset-track-master.component';

const routes: Routes = [
  {
    path: '',
    component: AssetTrackMasterComponent,
  },
  {
    path: 'import',
    component: AssetTrackImportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetTrackRoutingModule {}
