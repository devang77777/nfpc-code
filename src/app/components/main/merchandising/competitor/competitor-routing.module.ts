import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompetitorMasterComponent } from './competitor-master/competitor-master.component';
import { CompetitorImportComponent } from './competitor-import/competitor-import.component';

const routes: Routes = [
  {
    path: '',
    component: CompetitorMasterComponent,
  },
  { path: 'import', component: CompetitorImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompetitorRoutingModule { }
