import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { ExpensesRoutingModule } from './expense.routing.module';
import { ExpensesdtComponent } from './expensesdt/expensesdt.component';
import { ExpensesMasterComponent } from './expenses-master/expenses-master.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { AddExpensesComponent } from './add-expenses/add-expenses.component';
import { NgxPrintModule } from 'ngx-print';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  exports: [
    ExpensesdtComponent,
    ExpensesMasterComponent,
    ExpenseDetailComponent,
    AddExpensesComponent,
  ],
  declarations: [
    ExpensesdtComponent,
    ExpensesMasterComponent,
    ExpenseDetailComponent,
    AddExpensesComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgbPopoverModule,
    MaterialImportModule,
    ExpensesRoutingModule,
    NgxPrintModule,
  ],
})
export class ExpensesModule {}
