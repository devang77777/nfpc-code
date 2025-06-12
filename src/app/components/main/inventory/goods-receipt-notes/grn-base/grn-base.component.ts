import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GrnModel } from '../grn-models';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OrderService } from '../../../transaction/orders/order.service';
import { GrnExportComponent } from '../grn-export/grn-export.component';
@Component({
  selector: 'app-grn-base',
  templateUrl: './grn-base.component.html',
  styleUrls: ['./grn-base.component.scss'],
  providers: [OrderService]
})
export class GrnBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public grnData: GrnModel;
  public newGRNData = {};
  public checkedRows = [];
  module: any;

  private router: Router;

  constructor(router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog,
    private orderService: OrderService) {
    super('GRN');
    Object.assign(this, { router });
  }

  public openForm() {
    this.router.navigate(['inventory/grn', 'add']).then();
  }

  public itemClicked(data: GrnModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.grnData = data;
      const newModule = { ...this.module };
      newModule.module_id = data.id;
      this.module = JSON.parse(JSON.stringify(newModule));
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newGRNData = data;
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
          this.applyBulkAction(action);
        }
      });
  }

  applyBulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: '',
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
  public confirOrderApprovedReject(action): void {
    // let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${action}  for selected Records`,
          btnText: `${action}`
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.GRNApprovedReject(action);
        }
      });
  }
  GRNApprovedReject(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      if (element.isCheckEnable) {
        ids.push(element.objectid);
      }
    });
    let body = {
      action: action == 'Approved' ? true : false,
      uuids: ids
    };
    this.orderService.approvedRejected(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData({});
          this.newGRNData = res;
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }
  openExportGRN() {
    const dialogRef = this.dialog.open(GrnExportComponent);
  }
}
