import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { SalesmanUnload } from '../../salesman-unload/salesman-unload-interface';
import { PalletExportComponent } from '../pallet-export/pallet-export.component';

@Component({
  selector: 'app-pallet-master',
  templateUrl: './pallet-master.component.html',
  styleUrls: ['./pallet-master.component.scss']
})
export class PalletMasterComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public pallet: any;
  private fds: FormDrawerService;
  public newItemData = {};

  constructor(
    private router: Router,
    private dialog: MatDialog,
    fds: FormDrawerService,
    private route: ActivatedRoute
  ) {
    super('Pallet');
    Object.assign(this, { fds, router, route });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.create) {
        setTimeout(() => {
          this.openAddPallet();
        }, 500);
      }
    });
  }
  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.pallet = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportInfo() {
    const dialogRef = this.dialog.open(PalletExportComponent);
  }

  // openImpotInfo() {
  //   this.router.navigate(['merchandising/competitors', 'import']).then();
  // }
  updateTableData(data) {
    this.newItemData = data;
  }

  openAddPallet() {
    this.fds.setFormName('pallet');
    this.fds.setFormType('Add');
    this.fds.open();
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }
}
