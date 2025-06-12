import { ShelfImportComponent } from './shelf-import/shelf-import.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShelfDisplayMasterComponent } from './shelf-display-master/shelf-display-master.component';

const routes: Routes = [
  {
    path: '',
    component: ShelfDisplayMasterComponent,
  },
  {
    path: 'import',
    component: ShelfImportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShelfDisplayRoutingModule {}
