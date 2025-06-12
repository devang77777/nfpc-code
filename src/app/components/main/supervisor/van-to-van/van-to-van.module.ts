import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VanToVanDetailPageComponent } from './van-to-van-detail-page/van-to-van-detail-page.component';
import { VanToVanMasterComponent } from './van-to-van-master/van-to-van-master.component';
import { VanToVanDtComponent } from './van-to-van-dt/van-to-van-dt.component';
import { AddVanToVanComponent } from './add-van-to-van/add-van-to-van.component';
import { VanToVanRoutingModule } from './van-to-van-routing.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { VantoVanViewResolveService } from './Resolvers/van-view-resolver.service';
import { VanToVanResolverService } from './Resolvers/van-resolver.service';
import { SharedModule } from '../../../../features/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    VanToVanRoutingModule,
  ],
  declarations: [
    VanToVanDetailPageComponent,
    VanToVanMasterComponent,
    VanToVanDtComponent,
    AddVanToVanComponent,
  ],
  providers: [VantoVanViewResolveService, VanToVanResolverService, DatePipe],
})
export class VanToVanModule {}
