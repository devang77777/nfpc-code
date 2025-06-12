import { StockinstoreMasterComponent } from './stockinstore-master/stockinstore-master.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockinstoreImportComponent } from './stockinstore-import/stockinstore-import.component';


const routes: Routes = [
  {
    path: '',
    component: StockinstoreMasterComponent,

  },
  { path: 'import', component: StockinstoreImportComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class StockinstoreRoutingModule { }
