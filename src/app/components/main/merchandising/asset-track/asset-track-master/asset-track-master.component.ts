import { Component, OnInit, ViewChild } from '@angular/core';
import { AssetTrack } from '../asset-track-interface';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { AssetExportComponent } from '../asset-export/asset-export.component';

@Component({
  selector: 'app-asset-track-master',
  templateUrl: './asset-track-master.component.html',
  styleUrls: ['./asset-track-master.component.scss']
})
export class AssetTrackMasterComponent extends BaseComponent implements OnInit {

  @ViewChild('formDrawer') AssetTrackFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public AssetTrack: AssetTrack;
  private fds: FormDrawerService;
  public newAssetTrackData = {};
  checkedRows = [];
  constructor(fds: FormDrawerService, private router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Asset Tracking');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.AssetTrackFormDrawer);
  }

  updateTableData(data) {
    this.newAssetTrackData = data;
  }

  openAddAssetTrack() {
    this.fds.setFormName('add-AssetTrack');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.AssetTrack = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportAsset() {
    const dialogRef = this.dialog.open(AssetExportComponent);
  }

  openImportAsset() {
    this.router.navigate(['merchandising/asset-tracking', 'import']).then();
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
      module: 'AssetTracking',
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
