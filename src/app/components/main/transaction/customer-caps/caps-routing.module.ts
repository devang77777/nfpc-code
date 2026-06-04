import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CapsBaseComponent } from './caps-base/caps-base.component';
import { CapsImportComponent } from './caps-import/caps-import.component';


const routes: Routes = [
  {
    path: '',
    component: CapsBaseComponent
  },
//   {
//     path: 'detail',
//     redirectTo: ''
//   },
//   {
//     path: 'detail/:uuid',
//     resolve: {
//       note: CreditNoteViewResolveService
//     },
//     component: CreditNoteDetailComponent
//   },
//   {
//     path: 'edit/:uuid',
//     resolve: {
//       resolved: CreditNoteResolveService
//     },
//     component: CreditNoteFormComponent
//   },
//   {
//     path: 'add',
//     resolve: {
//       resolved: CreditNoteResolveService
//     },
//     component: CreditNoteFormComponent
//   },
  { path: 'import', component: CapsImportComponent },
//   { path: 'update', component: CreditNoteUpdateComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class CapsRoutingModule { }
