import { Component, OnInit } from '@angular/core';
import { VanToVanModel } from '../van-to-van.model';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-van-to-van-master',
  templateUrl: './van-to-van-master.component.html',
  styleUrls: ['./van-to-van-master.component.scss'],
})
export class VanToVanMasterComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public vanToVanData: VanToVanModel;
  public newVantovanData = {};
  public checkedRows = [];

  private router: Router;

  constructor(router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Van to Van Transfer');
    Object.assign(this, { router });
  }

  public openForm() {
    this.router.navigate(['supervisor/van-to-van-transfer/add']);
  }

  public itemClicked(data: VanToVanModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.vanToVanData = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newVantovanData = data;
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
      module: 'VantovanTransfer',
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
