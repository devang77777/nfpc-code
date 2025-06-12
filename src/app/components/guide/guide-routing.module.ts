import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MigrateComponent } from './views/migrate/migrate.component';


const routes: Routes = [
  {
    path: '',
    component: MigrateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuideRoutingModule { }
