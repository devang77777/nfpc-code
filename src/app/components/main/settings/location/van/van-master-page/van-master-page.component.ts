import { Component, ViewChild } from '@angular/core';
import { VanMaster } from '../van-master-dt/van-master-dt.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-van-master-page',
  templateUrl: './van-master-page.component.html',
  styleUrls: ['./van-master-page.component.scss'],
})
export class VanMasterPageComponent extends BaseComponent {
  @ViewChild('formDrawer') formDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public vanData: VanMaster;
  checkedRows = [];
  private fds: FormDrawerService;
  public newVanData = {};

  constructor(fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Van Master');
    Object.assign(this, { fds });
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.formDrawer);
  }
  public openAddVan() {
    this.fds.setFormName('add-van');
    this.fds.open();
    this.fds.setFormType('Add');
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.vanData = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  updateTableData(data) {
    this.newVanData = data;
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
      module: 'Van',
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

}
