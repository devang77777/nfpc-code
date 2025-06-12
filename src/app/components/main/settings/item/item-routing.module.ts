import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ItemUomsMasterPageComponent } from './item-uom/item-Uoms-master-page/items-Uoms-master-page.component';
import { ItemGroupMasterPageComponent } from './item-group/item-group-master-page/item-group-master-page.component';

const routes: Routes = [
    { path: 'item-uom', component: ItemUomsMasterPageComponent },
    { path: 'item-group', component: ItemGroupMasterPageComponent }
  ];
  
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ItemRoutingModule {}