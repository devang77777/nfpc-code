import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-estimatemaster',
  templateUrl: './estimatemaster.component.html',
  styleUrls: ['./estimatemaster.component.scss'],
})
export class EstimatemasterComponent extends BaseComponent implements OnInit {
  public isDetailVisible: boolean;
  public estimateData: any;
  public newEstimateData = {};
  public checkedRows = [];
  constructor(fds: FormDrawerService, private router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
  ) {
    super('Estimate');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }

  openAddExpenses() {
    this.router.navigate(['/estimate/add']);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.estimateData = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newEstimateData = data;
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
      module: 'Estimation',
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
