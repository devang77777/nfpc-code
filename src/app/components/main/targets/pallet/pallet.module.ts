import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPalletFormComponent } from './add-pallet-form/add-pallet-form.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { PalletRoutingModule } from './pallet-routing.module';
import { PalletDetailComponent } from './pallet-detail/pallet-detail.component';
import { PalletDtComponent } from './pallet-dt/pallet-dt.component';
import { PalletMasterComponent } from './pallet-master/pallet-master.component';
import { PalletService } from './pallet.service';
import { ChartModule } from 'primeng/chart';
import { NgxPrintModule } from 'ngx-print';
import { AgmCoreModule } from '@agm/core';
import { PalletPdfMakerService } from './pallet-pdf-maker.service';
import { PalletExportComponent } from './pallet-export/pallet-export.component';

@NgModule({
  declarations: [AddPalletFormComponent, PalletDetailComponent, PalletDtComponent, PalletMasterComponent, PalletExportComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    LightboxModule,
    ReactiveFormsModule,
    MaterialImportModule,
    PalletRoutingModule,
    ChartModule,
    NgxPrintModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAq6kI0d8-Y_RxUc0W0NmiTdq6AX9EW_GM',
      libraries: ['places']
    }),
  ],
  providers: [PalletService,PalletPdfMakerService],
})
export class PalletModule { }
