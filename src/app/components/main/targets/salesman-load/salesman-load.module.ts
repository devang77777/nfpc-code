import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SalesmanLoadPageComponent } from './salesman-load-page/salesman-load-page.component';
import { SalesmanLoadDetailComponent } from './salesman-load-detail/salesman-load-detail.component';
import { SalesmanLoadDtComponent } from './salesman-load-dt/salesman-load-dt.component';
import { AddSalesmanLoadFormComponent } from './add-salesman-load-form/add-salesman-load-form.component';
import { AddSalesmanLoadFormItemTableComponent } from './add-salesman-load-form/add-salesman-load-form-item-table/add-salesman-load-form-item-table.component';
import { SalesmanLoadRoutingModule } from './salesman-load-routing.module';
import { SalesmanLoadPdfMakerService } from "./salesman-load-detail-pdf.service";

@NgModule({
    declarations: [
        SalesmanLoadPageComponent,
        SalesmanLoadDetailComponent,
        SalesmanLoadDtComponent,
        AddSalesmanLoadFormComponent,
        AddSalesmanLoadFormItemTableComponent
    ],
    imports: [
        SalesmanLoadRoutingModule,
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialImportModule
    ],
    providers: [
        SalesmanLoadPdfMakerService
    ]
})

export class SalesmanLoadModule {

}