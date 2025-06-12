import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceBaseComponent } from './invoice-base/invoice-base.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoiceResolveService } from './resolvers/invoice-resolve.service';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { InvoiceViewResolveService } from './resolvers/invoice-view-resolve.service';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';
import { GenerateInvoiceResolveService } from './resolvers/generate-invoice-resolve.service';
import { InvoiceImportComponent } from './invoice-import/invoice-import.component';

const routes: Routes = [
  {
    path: '',
    component: InvoiceBaseComponent,
  },

  {
    path: 'add',
    resolve: {
      resolved: InvoiceResolveService,
    },
    component: InvoiceFormComponent,
  },
  {
    path: 'edit',
    redirectTo: '',
  },
  {
    path: 'edit/:uuid',
    resolve: {
      resolved: InvoiceResolveService,
      editResolve: InvoiceViewResolveService,
    },
    component: InvoiceFormComponent,
  },
  {
    path: 'generate-invoice/:uuid',
    resolve: {
      resolved: GenerateInvoiceResolveService,
    },
    component: GenerateInvoiceComponent,
  },
  { path: 'import', component: InvoiceImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule { }
