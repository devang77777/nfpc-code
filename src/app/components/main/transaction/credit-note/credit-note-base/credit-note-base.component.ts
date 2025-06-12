import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { OrderModel } from '../../orders/order-models';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CreditNoteExportComponent } from '../credit-note-export/credit-note-export.component';

@Component({
  selector: 'app-credit-note-base',
  templateUrl: './credit-note-base.component.html',
  styleUrls: ['./credit-note-base.component.scss'],
})
export class CreditNoteBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public creditNoteData: OrderModel;

  private router: Router;
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  private fds: FormDrawerService;
  module: any;
  checkedRows = [];
  newCreditData = {};
  currentRole = '';
  constructor(router: Router, fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Credit Note');
    Object.assign(this, { router, fds });
    this.module = {
      module: 'CreditNote ',
      module_id: '',
    };
    this.currentRole = localStorage.getItem('roleName');

  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }
  onClose() {
    this.fds.close();
  }
  openHistoryView() {
    this.fds.setFormName('History');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public openForm() {
    this.router.navigate(['transaction', 'credit-note', 'add']).then();
  }

  public itemClicked(data: OrderModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.creditNoteData = data;
      const newModule = { ...this.module };
      newModule.module_id = data.id;
      this.module = JSON.parse(JSON.stringify(newModule));
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportCredit() {
    const dialogRef = this.dialog.open(CreditNoteExportComponent);
  }

  openImportCredit() {
    this.router.navigate(['transaction/credit-note', 'import']).then();
  }

  openUpdateCredit() {
    this.router.navigate(['transaction/credit-note', 'update']).then();
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

  updateTableData(data) {
    this.newCreditData = data;
  }

  applyAulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'creditNote',
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
