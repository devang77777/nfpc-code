import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Warehouse } from '../warehouse-dt/warehouse-dt.component';
import { MatDrawer } from '@angular/material/sidenav';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-warehouse-master-page',
  templateUrl: './warehouse-master-page.component.html',
  styleUrls: ['./warehouse-master-page.component.scss']
})
export class WarehouseMasterPageComponent implements OnInit {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public warehouse: Warehouse;
  public newWarehouseData = {};
  public storageList: any[] = [];
  private fds: FormDrawerService;
  checkedRows = [];
  constructor(fds: FormDrawerService, private dataEditor: DataEditor, private apiService: ApiService, public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    Object.assign(this, { fds, });
  }

  ngOnInit(): void { }

  openAddWarehouse() {
    this.fds.setFormName('warehouse');
    this.fds.setFormType("Add");
    this.fds.open();
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }
  getList(id: any) {
    this.apiService.getStorageList(id).subscribe((res: any) => {
      this.storageList = res.data;
      this.dataEditor.nextSourceData(this.storageList);
      // if (this.storageList.length) {
      //   this.dataEditor.nextSourceData(this.storageList);
      // }
    });
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.warehouse = data;
      this.getList(this.warehouse.id);
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newWarehouseData = data;
    if (this.isDetailVisible) {
      this.getList(this.warehouse.id);
    }

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
      module: 'Warehouse',
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

