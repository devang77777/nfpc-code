import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Stockinstore } from '../stockinstore-interface';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { StockinstoreExportComponent } from '../stockinstore-export/stockinstore-export.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-stockinstore-master',
  templateUrl: './stockinstore-master.component.html',
  styleUrls: ['./stockinstore-master.component.scss'],
})
export class StockinstoreMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') StockFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public stock: Stockinstore;
  private fds: FormDrawerService;
  public newStockInStoreData = {};
  checkedRows = [];
  constructor(fds: FormDrawerService, private router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Stock In Store');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.StockFormDrawer);
  }

  openAddStockInStore() {
    this.fds.setFormName('add-stockinstore');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.stock = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }
  openExportStockstore() {
    const dialogRef = this.dialog.open(StockinstoreExportComponent);
  }

  openImportStockstore() {
    this.router.navigate(['merchandising/stockinstore', 'import']).then();
  }

  updateTableData(data) {
    this.newStockInStoreData = data;
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
      module: 'AssignInventory',
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
