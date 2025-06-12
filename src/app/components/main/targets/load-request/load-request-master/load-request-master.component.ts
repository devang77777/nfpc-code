import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { LoadRequest } from '../load-request-interface';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-load-request-master',
  templateUrl: './load-request-master.component.html',
  styleUrls: ['./load-request-master.component.scss']
})
export class LoadRequestMasterComponent extends BaseComponent implements OnInit {

  public isDetailVisible: boolean;
  public loadRequest: LoadRequest;
  public newLoadRequestData = {};
  public checkedRows = [];
  constructor(
    private router: Router,
    private dialog: MatDialog, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
  ) {
    super('Load Request');
  }

  ngOnInit(): void { }
  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.loadRequest = data;
    }
  }

  openAddLoadReq() {
    this.router.navigate(['target/load-request/add']);
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newLoadRequestData = data;
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
      module: 'LoadRequest',
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
