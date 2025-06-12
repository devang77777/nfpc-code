import { Component, ViewChild } from '@angular/core';
import { RouteMaster } from '../route-master-dt/route-master-dt.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { RouteExportComponent } from '../route-export/route-export.component';
import { MatDialog } from '@angular/material/dialog';
// import { FormDrawerService } from '../../../../services/form-drawer.service';
// import { RouteMaster } from '../../../datatables/route-master-dt/route-master-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-route-page',
  templateUrl: './route-page.component.html',
  styleUrls: ['./route-page.component.scss'],
})
export class RoutePageComponent extends BaseComponent {
  @ViewChild('formDrawer') formDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public routeData: RouteMaster;
  checkedRows = [];
  private fds: FormDrawerService;
  public newRouteData = {};

  constructor(fds: FormDrawerService, private dialog: MatDialog, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Route');
    Object.assign(this, { fds });
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.formDrawer);
  }
  public openAddRoute() {
    this.fds.setFormName('add-route');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.routeData = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportRoute() {
    const dialogRef = this.dialog.open(RouteExportComponent);
  }

  openImportRoute() {
    // this.router.navigate(['masters/customer', 'import']).then();
  }

  updateTableData(data) {
    this.newRouteData = data;
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
      module: 'Route',
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

  downloadRoute() {
    let body = {
      type: 'route',
    };
    this.apiService.getSalesmanData(body).subscribe(
      (res) => {

      })
  }
}
