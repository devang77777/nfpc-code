import { NgModule } from '@angular/core';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GroupingRoutingModule } from './grouping-routing.module';
import { GroupingService } from './grouping.service';

@NgModule({
    declarations: [],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialImportModule,
        GroupingRoutingModule
    ],
    providers: [
        GroupingService
    ]
})
export class GroupingModule {}