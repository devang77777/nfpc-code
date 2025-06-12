import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DebitNoteBaseComponent } from './debit-note-base/debit-note-base.component';
import { DebitNoteDetailComponent } from './debit-note-detail/debit-note-detail.component';
import { DebitNoteFormComponent } from './debit-note-form/debit-note-form.component';
import { DebitNoteViewResolveService } from './resolvers/debit-note-view-resolve.service';
import { DebitNoteResolveService } from './resolvers/debit-note-resolve.service';

const routes: Routes = [
  {
    path: '',
    component: DebitNoteBaseComponent
  },
  {
    path: 'detail',
    redirectTo: ''
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved: DebitNoteResolveService,
      note: DebitNoteViewResolveService
    },
    component: DebitNoteFormComponent
  },
  {
    path: 'add',
    resolve: {
      resolved: DebitNoteResolveService
    },
    component: DebitNoteFormComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DebitNoteRoutingModule { }
