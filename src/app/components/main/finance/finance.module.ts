import { NgModule } from '@angular/core';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceRoutingModule } from './finance-routing.module';

@NgModule({
    declarations: [],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialImportModule,
        FinanceRoutingModule
    ],
    providers: []
})
export class FinanceModule {}