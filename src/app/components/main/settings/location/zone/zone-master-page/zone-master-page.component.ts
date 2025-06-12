import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { ZoneMasterDtComponent } from '../zone-master-dt/zone-master-dt.component';

@Component({
  selector: 'app-zone-master-page',
  templateUrl: './zone-master-page.component.html',
  styleUrls: ['./zone-master-page.component.scss']
})
export class ZoneMasterPageComponent extends BaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('formDrawer') countryFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public zoneMaster: ZoneMasterDtComponent;
  public newZoneData = {};
  checkedRows = [];
  private fds: FormDrawerService;
  constructor(
    fds: FormDrawerService,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Zone');
    Object.assign(this, { fds });
  }
  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.countryFormDrawer);
  }
  openAddZone() {
    this.fds.setFormName('zone');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.zoneMaster = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportZone() {
    // const dialogRef = this.dialog.open(ZoneExportComponent);
  }

  openImportZone() {
    // this.router.navigate(['masters/customer', 'import']).then();
  }

  updateTableData(data) {
    this.newZoneData = data;
  }

  public bulkAction(action): void {
    const phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
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
    const body = {
      module: 'Zone',
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
