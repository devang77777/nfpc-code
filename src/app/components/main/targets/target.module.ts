import { NgModule } from "@angular/core";
import { TargetRoutingModule } from "./target-routing.module";
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SalesmanLoadModule } from './salesman-load/salesman-load.module';


@NgModule({
    declarations: [],
    imports: [
        TargetRoutingModule,
        SalesmanLoadModule,
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialImportModule
    ]
})

export class TargetModule {

}