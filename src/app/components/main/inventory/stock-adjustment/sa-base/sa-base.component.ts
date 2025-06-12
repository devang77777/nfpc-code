import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-sa-base',
  templateUrl: './sa-base.component.html',
  styleUrls: ['./sa-base.component.scss'],
})
export class SaBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public newSAData = {};
  public checkedRows = [];

  private router: Router;

  constructor(router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Stock Adjustment');
    Object.assign(this, { router });
  }

  public openForm() {
    this.router.navigate(['inventory/stock-adjustment', 'add']);
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newSAData = data;
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
      module: 'StockAdjustment',
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
