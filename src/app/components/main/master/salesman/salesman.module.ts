import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SalesmanPageComponent } from './salesman-page/salesman-page.component';
import { SalesmanDtComponent } from './salesman-dt/salesman-dt.component';
import { SalesmanDetailComponent } from './salesman-detail/salesman-detail.component';
import { AddSalesmanFormComponent } from './add-salesman-form/add-salesman-form.component';
import { MasterSalesmanRoutingModule } from './salesman-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SalesmanResolveService } from './salesman-resolve.service';
import { SalesmanImportComponent } from './salesman-import/salesman-import.component';
import { SalesmanExportComponent } from './salesman-export/salesman-export.component';
import { SalesmanActivityDetailComponent } from './salesman-activity-detail/salesman-activity-detail.component';
import { AgmCoreModule } from '@agm/core';
import { SalesmanLobComponent } from './salesman-lob/salesman-lob.component';
import { LoginInfoComponent } from './salesman-detail/login-info/login-info.component';
@NgModule({
    declarations: [
        SalesmanPageComponent,
        SalesmanDtComponent,
        SalesmanDetailComponent,
        AddSalesmanFormComponent,
        SalesmanExportComponent,
        SalesmanImportComponent,
        SalesmanActivityDetailComponent,
        LoginInfoComponent,
        SalesmanLobComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialImportModule,
        MasterSalesmanRoutingModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAq6kI0d8-Y_RxUc0W0NmiTdq6AX9EW_GM',
            libraries: ['places', 'drawing', 'geometry']
        }),
    ],
    providers: [
        SalesmanResolveService
    ]
})
export class SalesmanModule { }