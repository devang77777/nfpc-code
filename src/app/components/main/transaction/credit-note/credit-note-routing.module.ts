import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreditNoteBaseComponent } from './credit-note-base/credit-note-base.component';
import { CreditNoteDetailComponent } from './credit-note-detail/credit-note-detail.component';
import { CreditNoteViewResolveService } from './resolvers/credit-note-view-resolve.service';
import { CreditNoteResolveService } from './resolvers/credit-note-resolve.service';
import { CreditNoteFormComponent } from './credit-note-form/credit-note-form.component';
import { CreditNoteImportComponent } from './credit-note-import/credit-note-import.component';
import { CreditNoteUpdateComponent } from './credit-note-update/credit-note-update.component';

const routes: Routes = [
  {
    path: '',
    component: CreditNoteBaseComponent
  },
  {
    path: 'detail',
    redirectTo: ''
  },
  {
    path: 'detail/:uuid',
    resolve: {
      note: CreditNoteViewResolveService
    },
    component: CreditNoteDetailComponent
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved: CreditNoteResolveService
    },
    component: CreditNoteFormComponent
  },
  {
    path: 'add',
    resolve: {
      resolved: CreditNoteResolveService
    },
    component: CreditNoteFormComponent
  },
  { path: 'import', component: CreditNoteImportComponent },
  { path: 'update', component: CreditNoteUpdateComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class CreditNoteRoutingModule { }
