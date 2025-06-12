import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideRoutingModule } from './guide-routing.module';
import { MigrateComponent } from './views/migrate/migrate.component';


@NgModule({
  declarations: [MigrateComponent],
  imports: [
    CommonModule,
    GuideRoutingModule
  ]
})
export class GuideModule { }
