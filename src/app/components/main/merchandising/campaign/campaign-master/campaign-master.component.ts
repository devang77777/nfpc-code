import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { Campaign } from '../campaign-interface';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Router } from '@angular/router';
import { CampaignExportComponent } from '../campaign-export/campaign-export.component';

@Component({
  selector: 'app-campaign-master',
  templateUrl: './campaign-master.component.html',
  styleUrls: ['./campaign-master.component.scss'],
})
export class CampaignMasterComponent extends BaseComponent implements OnInit {
  public isDetailVisible: boolean;
  public campaign: Campaign;
  public newCompaignData = {};
  checkedRows = [];
  constructor(private router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Campaign');
  }

  ngOnInit(): void { }
  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.campaign = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportCampaign() {
    const dialogRef = this.dialog.open(CampaignExportComponent);
  }

  openImpotCampaign() {
    this.router.navigate(['merchandising/campaigns', 'import']).then();
  }

  updateTableData(data) {
    this.newCompaignData = data;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
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
      module: 'CampaignPicture',
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
