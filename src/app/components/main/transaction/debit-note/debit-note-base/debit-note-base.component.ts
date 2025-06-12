import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { OrderModel } from 'src/app/components/main/transaction/orders/order-models';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DebitNoteExportComponent } from '../debit-note-export/debit-note-export.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DebitOptionsDialogComponent } from 'src/app/components/dialogs/debit-options-dialog/debit-options-dialog.component';

@Component({
  selector: 'app-debit-note-base',
  templateUrl: './debit-note-base.component.html',
  styleUrls: ['./debit-note-base.component.scss'],
})
export class DebitNoteBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public debitNoteData: OrderModel;
  public checkedRows = [];
  public newDebitData = {};

  private router: Router;
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  private fds: FormDrawerService;
  module: any;
  constructor(public dialogRef: MatDialog, router: Router, fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Debit Note');
    Object.assign(this, { router, fds });
    this.module = {
      module: 'DebitNote ',
      module_id: '',
    };
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  openHistoryView() {
    this.fds.setFormName('History');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: OrderModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.debitNoteData = data;
      const newModule = { ...this.module };
      newModule.module_id = data.id;
      this.module = JSON.parse(JSON.stringify(newModule));
    }
  }
  onClose() {
    this.fds.close();
  }
  public openForm() {
    this.router.navigate(['transaction/debit-note', 'add']);
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportDebit() {
    const dialogRef = this.dialog.open(DebitNoteExportComponent);
  }

  openImportDebit() {
    this.router.navigate(['transaction/debit-note', 'import']).then();
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newDebitData = data;
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
      module: 'DebitNote',
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

  public opendiscountDialog(type, label): void {
    let data = {
      type: type,
      label: label,
      debitNoteData: this.debitNoteData
    };
    this.dialogRef
      .open(DebitOptionsDialogComponent, {
        width: '550px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        this.updateTableData(res);
      });
  }

}
