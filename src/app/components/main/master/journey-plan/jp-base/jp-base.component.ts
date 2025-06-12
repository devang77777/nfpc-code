import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { JourneyPlanModel } from '../journey-plan-model';
import { JourneyplanExportComponent } from '../journeyplan-export/journeyplan-export.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-journey-plan-base',
  templateUrl: './jp-base.component.html',
  styleUrls: ['./jp-base.component.scss'],
})
export class JpBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public journeyPlanData: any;

  private router: Router;
  public newJourneyPlanData = {};
  checkedRows = [];

  constructor(router: Router,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Journey Plan');
    Object.assign(this, { router });
  }

  public openAddJourneyPlan() {
    this.router.navigate(['masters/journey-plan', 'add']).then();
  }

  public itemClicked(data: JourneyPlanModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.journeyPlanData = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportJp() {
    const dialogRef = this.dialog.open(JourneyplanExportComponent);
  }

  openImportJp() {
    this.router.navigate(['masters/journey-plan', 'import']).then();
  }

  updateTableData(data) {
    //console.log(data);
    this.newJourneyPlanData = data;
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

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  applyAulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'JourneyPlan',
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
