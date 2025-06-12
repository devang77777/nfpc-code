import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReplaceComponent } from './views/replace/replace.component';


const routes: Routes = [{ path: '', component: ReplaceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchandisingReplaceRoutingModule { }
