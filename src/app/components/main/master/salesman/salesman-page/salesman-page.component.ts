import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { SalesMan } from '../salesman-dt/salesman-dt.component';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { SalesmanExportComponent } from '../salesman-export/salesman-export.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-salesman-page',
  templateUrl: './salesman-page.component.html',
  styleUrls: ['./salesman-page.component.scss'],
})
export class SalesmanPageComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public salesMan: SalesMan;
  checkedRows = [];
  private fds: FormDrawerService;
  public activityView: boolean = false;
  public newSalesmanData = {};
  public domain = window.location.host.split('.')[0];
  constructor(fds: FormDrawerService,
    private router: Router,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Salesman');
    Object.assign(this, { fds, router });
  }
  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  openAddSalesMan() {
    this.fds.setFormName('salesMan');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  openActivityMap() {
    this.activityView = true;
  }

  mapDetailsClosed() {
    this.activityView = false;
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.salesMan = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }
  openExportSalesman() {
    const dialogRef = this.dialog.open(SalesmanExportComponent);
  }

  openImpotSalesman() {
    if (this.domain == 'merchandising' || this.domain == 'nfpc') {
      this.router.navigate(['masters/merchandiser', 'import']).then();
    } else {
      this.router.navigate(['masters/salesman', 'import']).then();
    }

  }

  updateTableData(data) {
    this.newSalesmanData = data;
  }

  public bulkAction(action): void {
    let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction(action);
        }
      });
  }

  applyAulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'SalesmanInfo',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData(body);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }

  downloadSalesmanReport() {
    let body = {
      type: 'salesman',
    };
    this.apiService.getSalesmanData(body).subscribe(
      (res) => {

      })

  }
}
