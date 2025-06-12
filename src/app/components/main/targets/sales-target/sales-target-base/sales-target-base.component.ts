import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SalesTargetModel } from '../sales-target-model';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-sales-target-base',
  templateUrl: './sales-target-base.component.html',
  styleUrls: ['./sales-target-base.component.scss'],
})
export class SalesTargetBaseComponent extends BaseComponent {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public salesTargetData: SalesTargetModel;
  public newSalesTargetData = {};
  public checkedRows = [];

  private fds: FormDrawerService;
  private router: Router;

  constructor(fds: FormDrawerService, router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Sales Target');
    Object.assign(this, { fds, router });
  }

  // public openAddForm() {
  //   this.router.navigate(['target/sales-target/add']);
  // }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  public openAddForm() {
    this.fds.setFormName('sales-target');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.salesTargetData = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  updateTableData(data) {
    this.newSalesTargetData = data;
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
      module: 'SalesTarget',
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
