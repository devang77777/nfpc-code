import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ItemPageComponent } from './item-page/item-page.component';
import { ItemResolveService } from './item-resolve.service';
import { ItemImportComponent } from './item-import/item-import.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      item_resolve: ItemResolveService
    },
    component: ItemPageComponent
  },
  { path: 'import', component: ItemImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterItemsRoutingModule { }