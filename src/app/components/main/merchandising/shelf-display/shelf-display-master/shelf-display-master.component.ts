import { Component, OnInit, ViewChild } from '@angular/core';
import { ShelfDisplay } from '../shelf-display-interface';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ShelfDisplayExportComponent } from '../shelf-display-export/shelf-display-export.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-shelf-display-master',
  templateUrl: './shelf-display-master.component.html',
  styleUrls: ['./shelf-display-master.component.scss']
})
export class ShelfDisplayMasterComponent extends BaseComponent implements OnInit {

  @ViewChild('formDrawer') ShelfDisplayFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public ShelfDisplay: ShelfDisplay;
  private fds: FormDrawerService;
  public newShelfDisplayData = {};
  checkedRows = [];

  constructor(fds: FormDrawerService, private router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Shelf Display');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.ShelfDisplayFormDrawer);
  }

  updateTableData(data) {
    //console.log(data);
    this.newShelfDisplayData = data;
  }

  openAddShelfDisplay() {
    this.fds.setFormName('add-shelfdisplay');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.ShelfDisplay = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportShelf() {
    const dialogRef = this.dialog.open(ShelfDisplayExportComponent);
  }

  openImportShelf() {
    this.router.navigate(['merchandising/shelf-display', 'import']).then();
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
      module: 'Distribution',
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
